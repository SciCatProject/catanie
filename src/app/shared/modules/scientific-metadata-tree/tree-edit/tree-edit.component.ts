import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChange,
} from "@angular/core";
import { FlatTreeControl } from "@angular/cdk/tree";
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from "@angular/material/tree";
import { Observable } from "rxjs";
import {
  FlatNode,
  TreeBaseComponent,
  TreeNode,
} from "shared/modules/scientific-metadata-tree/base-classes/tree-base";
import { InputData } from "shared/modules/scientific-metadata-tree/metadata-input/metadata-input.component";
import { HistoryManager } from "shared/modules/scientific-metadata-tree/base-classes/history-manager";
import { MatDialog } from "@angular/material/dialog";
import {
  InputObject,
  MetadataInputModalComponent,
} from "../metadata-input-modal/metadata-input-modal.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DatePipe } from "@angular/common";
import { Type } from "../base-classes/metadata-input-base";
import { DateTime } from "luxon";

export class FlatNodeEdit implements FlatNode {
  key: string;
  value: any;
  unit: string;
  level: number;
  expandable: boolean;
  visible: boolean;
  editing: boolean;
  editable: boolean;
}

@Component({
  selector: "tree-edit",
  templateUrl: "./tree-edit.component.html",
  styleUrls: ["./tree-edit.component.scss"],
})
export class TreeEditComponent
  extends TreeBaseComponent
  implements OnInit, OnChanges
{
  private changed = false;
  @Input() metadata: any;
  currentEditingNode: FlatNodeEdit | null = null;
  lastSavedChanges = -1;
  filteredUnits$: Observable<string[]>;
  historyManager: HistoryManager;
  @Output() save = new EventEmitter<Record<string, unknown>>();
  @Output() hasUnsavedChanges = new EventEmitter<boolean>();

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    datePipe: DatePipe,
  ) {
    super();
    this.datePipe = datePipe;
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren,
    );
    this.treeControl = new FlatTreeControl<FlatNodeEdit>(
      this.getLevel,
      this.isExpandable,
    );
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener,
    );
    this.nestNodeMap = new Map<TreeNode, FlatNodeEdit>();
    this.flatNodeMap = new Map<FlatNodeEdit, TreeNode>();
    this.historyManager = new HistoryManager();
    this.historyManager.indexChanged.subscribe((index: number) => {
      this.hasUnsavedChanges.emit(this.lastSavedChanges !== index);
    });
  }
  ngOnInit() {
    this.dataTree = this.buildDataTree(this.metadata, 0);
    this.dataSource.data = this.dataTree;
    this.setEditable();
  }
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    for (const propName in changes) {
      if (propName === "metadata") {
        this.metadata = changes[propName].currentValue;
        this.dataTree = this.buildDataTree(this.metadata, 0);
        this.dataSource.data = this.dataTree;
        this.setEditable();
        this.filterText = this._filterText;
      }
    }
  }
  transformer = (node: TreeNode, level: number): FlatNodeEdit => {
    const existingNode = this.nestNodeMap.get(node) as FlatNodeEdit;
    const flatNode = existingNode ? existingNode : new FlatNodeEdit();
    flatNode.key = node.key;
    flatNode.level = level;
    flatNode.value = node.value;
    flatNode.expandable = node.children?.length > 0;
    flatNode.unit = node.unit;
    if (!existingNode) {
      // Important only set for new node
      flatNode.editing = node.key === "" ? true : false;
      flatNode.editable = Array.isArray(node.value) ? false : true;
      flatNode.visible = true;
    }
    this.flatNodeMap.set(flatNode, node);
    this.nestNodeMap.set(node, flatNode);
    return flatNode;
  };

  setEditable() {
    const length = this.treeControl.dataNodes.length;
    let currentIdx = 0;
    while (currentIdx < length) {
      const node = this.treeControl.dataNodes[currentIdx] as FlatNodeEdit;
      if (Array.isArray(node.value)) {
        node.editable = false;
        currentIdx++;
        while (currentIdx < length) {
          const childNode = this.treeControl.dataNodes[
            currentIdx
          ] as FlatNodeEdit;
          if (childNode.level > node.level) {
            //A child node
            childNode.editable = false;
            currentIdx++;
          } else {
            //Not a child node
            break;
          }
        }
      } else {
        node.editable = true;
        currentIdx++;
      }
    }
  }

  convertDataTreeToObject(tree: TreeNode[]): { [key: string]: any } {
    return tree.reduce((accumulator, node) => {
      if (this.hasNoContent(node)) {
        return accumulator;
      }
      if (Array.isArray(node.value)) {
        accumulator[node.key] = node.value;
        return accumulator;
      }
      if (node.children && node.children.length > 0) {
        accumulator[node.key] = this.convertDataTreeToObject(node.children);
      } else {
        if (node.unit) {
          accumulator[node.key] = { value: node.value, unit: node.unit };
        } else {
          accumulator[node.key] = node.value;
        }
      }
      return accumulator;
    }, {});
  }

  openSnackbar(message: string, action = "") {
    this.snackBar.open(message, action, {
      duration: 3000,
    });
  }
  onSave(data: Event) {
    const nestedNode = this.flatNodeMap.get(this.currentEditingNode);
    const parentNode = this.getNestedParent(this.nestNodeMap.get(nestedNode));
    const { children, ...oldData } = nestedNode;
    const index = this.getIndex(parentNode, nestedNode);
    this.historyManager.add({
      undo: () => {
        if (oldData.key === "") {
          this.removeNode(parentNode, nestedNode);
        } else {
          nestedNode.key = oldData.key;
          nestedNode.value = oldData.value;
          nestedNode.unit = oldData.unit;
        }
        this.dataSource.data = this.dataTree;
      },
      redo: () => {
        if (oldData.key === "") {
          this.insertNode(parentNode, nestedNode, index);
        }
        this.updateNode(nestedNode, data as unknown as InputData);
      },
    });
    this.updateNode(nestedNode, data as unknown as InputData);
    this.openSnackbar(
      "Your changes are cached, hit the save button to save to database !",
    );
    this.disableEditing();
  }
  onCancel() {
    this.disableEditing();
  }
  disableEditing() {
    if (this.currentEditingNode) {
      this.currentEditingNode.editing = false;
      if (this.hasNoContent(this.currentEditingNode)) {
        const parent = this.getNestedParent(this.currentEditingNode);
        const node = this.flatNodeMap.get(this.currentEditingNode);
        this.removeNode(parent, node);
      }
    }
    this.currentEditingNode = null;
    this.changed = false;
  }
  enableEditing(node: FlatNodeEdit) {
    if (this.currentEditingNode) {
      if (this.changed) {
        this.snackBar.open(
          "You are making changes in another row, please cancle or cache the changes first!",
          "",
          {
            duration: 3000,
          },
        );
        return;
      }
      this.disableEditing();
    }
    if (node.editable) {
      this.currentEditingNode = node;
      this.currentEditingNode.editing = true;
    } else {
      this.openSnackbar("This field is not editable");
    }
  }
  onChange() {
    this.changed = true;
  }
  addNewNode(parentNode: FlatNodeEdit) {
    const newNode = new TreeNode();
    newNode.key = "";
    const nestedParentNode = this.flatNodeMap.get(parentNode);
    this.insertNode(nestedParentNode, newNode);
    this.treeControl.expand(parentNode);
    this.enableEditing(this.nestNodeMap.get(newNode) as FlatNodeEdit);
  }
  deleteNode(node: FlatNodeEdit) {
    const parentNode = this.getNestedParent(node);
    const nestedNode = this.flatNodeMap.get(node);
    const childIndex = this.getIndex(parentNode, nestedNode);
    this.historyManager.add({
      undo: () => {
        if (parentNode && parentNode.children.length === 0) {
          // Removing and readd parentNode before adding childNode is needed since matTree won't rerender the parentNode properly
          const grandfatherNode = this.getNestedParent(
            this.nestNodeMap.get(parentNode),
          );
          const parentIndex = this.getIndex(grandfatherNode, parentNode);
          this.removeNode(grandfatherNode, parentNode);
          this.insertNode(parentNode, nestedNode, childIndex);
          this.insertNode(grandfatherNode, parentNode, parentIndex);
        } else {
          this.insertNode(parentNode, nestedNode, childIndex);
        }
      },
      redo: () => {
        this.removeNode(parentNode, nestedNode);
      },
    });
    this.removeNode(parentNode, nestedNode);
  }
  updateNode(node: TreeNode, data: InputData) {
    switch (data.type) {
      case Type.date:
        node.key = data.key;
        node.value = DateTime.fromISO(data.value).toUTC().toISO();
        node.unit = null;
        break;
      case Type.string:
        node.key = data.key;
        node.value = data.value;
        node.unit = null;
        break;
      case Type.number:
        node.key = data.key;
        node.value = Number(data.value);
        node.unit = null;
        break;
      case Type.boolean:
        node.key = data.key;
        node.value = data.value.toLowerCase() === "true" ? true : false;
        node.unit = null;
        break;
      case Type.quantity:
        node.key = data.key;
        node.value = Number(data.value);
        node.unit = data.unit;
        break;
      default:
    }
    this.dataSource.data = this.dataTree;
  }

  hasNoContent = (node: TreeNode | FlatNodeEdit) => node.key === "";

  isEditing() {
    return this.currentEditingNode ? true : false;
  }
  doSave() {
    this.metadata = this.convertDataTreeToObject(this.dataTree);
    this.save.emit(this.metadata);
    this.hasUnsavedChanges.emit(false);
    this.historyManager.clearHistory();
    this.lastSavedChanges = this.historyManager.currentIdx;
  }

  openObjectCreationDialog(node: FlatNodeEdit): void {
    const dialogRef = this.dialog.open(MetadataInputModalComponent, {
      width: "auto",
      data: node,
    });

    dialogRef.afterClosed().subscribe((data: InputObject) => {
      if (data) {
        const grandfatherNode = this.flatNodeMap.get(node);
        const parentNode = new TreeNode();
        parentNode.key = data.parent;
        const childNode = new TreeNode();
        const { parent, ...childData } = data;
        parentNode.children = [];
        this.insertNode(parentNode, childNode);
        this.updateNode(childNode, { ...childData, key: childData.child });
        this.insertNode(grandfatherNode, parentNode);
        const index = this.getIndex(grandfatherNode, parentNode);
        this.treeControl.expand(node);
        this.historyManager.add({
          undo: () => {
            this.removeNode(grandfatherNode, parentNode);
          },
          redo: () => {
            this.insertNode(grandfatherNode, parentNode, index);
          },
        });
        this.dataSource.data = this.dataTree;
      }
    });
  }
}
