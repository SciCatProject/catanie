import { DatePipe } from "@angular/common";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DateTime } from "luxon";
import { FlatNode, TreeNode } from "../base-classes/tree-base";
import { TreeEditComponent } from "../tree-edit/tree-edit.component";
import { ScientificMetadataTreeModule } from "../scientific-metadata-tree.modules";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

describe("TreeBaseComponent", () => {
  let component: TreeEditComponent;
  let fixture: ComponentFixture<TreeEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TreeEditComponent],
      imports: [ScientificMetadataTreeModule, BrowserAnimationsModule],
      providers: [MatDialog, MatSnackBar, DatePipe],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeEditComponent);
    component = fixture.componentInstance;
    component.metadata = {
      motors: {
        sampx: {
          value: -0.03949844939218141,
          unit: "mm",
        },
        sampy: {
          value: 0.003037629787175808,
          unit: "mm",
        },
      },
    };
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("#buildDataTree()", () => {
    it("should build dataTree initial metadata", () => {
      component.metadata = {
        motors: {
          sampx: {
            value: -0.03949844939218141,
            unit: "mm",
          },
          sampy: {
            value: 0.003037629787175808,
            unit: "mm",
          },
        },
        take_snapshots: 1,
        shape: "2DP1",
        in_interleave: false,
        wavelength: {
          value: 0.9789504111255567,
          unit: "angstrom",
        },
        cell: [0, 0, 0, 0, 0, 0],
        creationTime: "2020-10-01 18:01:30",
        comment: "Bad run",
      };
      component.dataTree = component.buildDataTree(component.metadata, 0);
      expect(component.dataTree.length).toEqual(8);
      expect(component.dataTree[0]).toBeInstanceOf(TreeNode);
    });
    it("should build dataTree with two child nodes", () => {
      component.dataTree = component.buildDataTree(
        {
          motors: {
            sampx: {
              value: -0.03949844939218141,
              unit: "mm",
            },
            sampy: {
              value: 0.003037629787175808,
              unit: "mm",
            },
          },
        },
        0,
      );
      expect(component.dataTree.length).toEqual(1);
      expect(component.dataTree[0].key).toEqual("motors");
      expect(component.dataTree[0].value).toEqual(undefined);
      expect(component.dataTree[0].children.length).toEqual(2);
      expect(component.dataTree[0].unit).toEqual(undefined);
    });
    it("should build dataTree with one node without child", () => {
      component.dataTree = component.buildDataTree(
        {
          in_interleave: false,
        },
        0,
      );
      expect(component.dataTree.length).toEqual(1);
      expect(component.dataTree[0].key).toEqual("in_interleave");
      expect(component.dataTree[0].value).toEqual(false);
      expect(component.dataTree[0].children).toEqual(undefined);
      expect(component.dataTree[0].unit).toEqual(undefined);
    });
    it("should build dataTree with one node and value is null", () => {
      component.dataTree = component.buildDataTree(
        {
          in_interleave: null,
        },
        0,
      );
      expect(component.dataTree.length).toEqual(1);
      expect(component.dataTree[0].key).toEqual("in_interleave");
      expect(component.dataTree[0].value).toEqual(null);
      expect(component.dataTree[0].children).toEqual(undefined);
      expect(component.dataTree[0].unit).toEqual(undefined);
    });
    it("should build dataTree with two child nodes and value is array", () => {
      component.dataTree = component.buildDataTree(
        {
          array: [0, 1],
        },
        0,
      );
      expect(component.dataTree.length).toEqual(1);
      expect(component.dataTree[0].key).toEqual("array");
      expect(component.dataTree[0].value).toBeInstanceOf(Array);
      expect(component.dataTree[0].children.length).toEqual(2);
      expect(component.dataTree[0].unit).toEqual(undefined);
    });
    it("should build dataTree with node that value and unit", () => {
      component.dataTree = component.buildDataTree(
        {
          angle: {
            value: 1,
            unit: "deg",
          },
        },
        0,
      );
      expect(component.dataTree.length).toEqual(1);
      expect(component.dataTree[0].key).toEqual("angle");
      expect(component.dataTree[0].value).toEqual(1);
      expect(component.dataTree[0].children).toEqual(undefined);
      expect(component.dataTree[0].unit).toEqual("deg");
    });
  });
  describe("#performFilter()", () => {
    it("Should filte nodes", () => {
      component.metadata = {
        comment: " Good",
        motors: {
          sampx: {
            value: -0.03949844939218141,
            unit: "mm",
          },
          sampy: {
            value: 0.003037629787175808,
            unit: "mm",
          },
        },
      };
      component.ngOnInit();
      component.performFilter("samp");
      component.treeControl.dataNodes.forEach((node: FlatNode) => {
        if (node.key === "comment") {
          expect(node.visible).toBeFalse();
        } else {
          expect(node.visible).toBeTrue();
        }
      });
    });
  });
  describe("#setParentVisible()", () => {
    it("should set parent node visible", () => {
      component.metadata = {
        motors: {
          motor1: {
            sampx: {
              value: -0.03949844939218141,
              unit: "mm",
            },
            sampy: {
              value: 0.003037629787175808,
              unit: "mm",
            },
          },
          motor2: {
            sampx: {
              value: -0.03949844939218141,
              unit: "mm",
            },
            sampy: {
              value: 0.003037629787175808,
              unit: "mm",
            },
          },
        },
      };
      component.ngOnInit();
      component.hideAllNodes();
      component.setParentVisible(
        component.treeControl.dataNodes[
          component.treeControl.dataNodes.length - 1
        ],
      );
      component.treeControl.dataNodes.forEach(
        (node: FlatNode, index: number) => {
          if (node.key === "motor2" || node.key === "motors") {
            expect(node.visible).toBeTrue();
          } else {
            expect(node.visible).toBeFalse();
          }
        },
      );
    });
  });
  describe("#setChildrenVisible()", () => {
    it("should set child nodes visible", () => {
      component.metadata = {
        motors: {
          motor1: {
            sampx: {
              value: -0.03949844939218141,
              unit: "mm",
            },
            sampy: {
              value: 0.003037629787175808,
              unit: "mm",
            },
          },
          motor2: {
            sampx: {
              value: -0.03949844939218141,
              unit: "mm",
            },
            sampy: {
              value: 0.003037629787175808,
              unit: "mm",
            },
          },
        },
      };
      component.ngOnInit();
      component.hideAllNodes();
      component.setChildrenVisible(component.dataTree[0].children);
      component.treeControl.dataNodes.forEach(
        (node: FlatNode, index: number) => {
          if (index === 0) {
            expect(node.visible).toBeFalse();
          } else {
            expect(node.visible).toBeTrue();
          }
        },
      );
    });
  });
  describe("#getFlatParentNode()", () => {
    it("should return null", () => {
      const result = component.getFlatParentNode(
        component.treeControl.dataNodes[0],
      );
      expect(result).toBeNull();
    });
    it("should return parent node", () => {
      const result = component.getFlatParentNode(
        component.treeControl.dataNodes[1],
      );
      expect(result).toEqual(component.treeControl.dataNodes[0]);
    });
  });
  describe("#getNestedParent()", () => {
    it("should return undefined", () => {
      const result = component.getNestedParent(
        component.treeControl.dataNodes[0],
      );
      expect(result).toBeUndefined();
    });
    it("should return a parent node", () => {
      const result = component.getNestedParent(
        component.treeControl.dataNodes[1],
      );
      expect(result).toEqual(component.dataTree[0]);
    });
  });
  describe("#insertNode()", () => {
    it("Should insert node on the top level", () => {
      component.insertNode(null, new TreeNode());
      expect(component.dataTree.length).toEqual(2);
    });
    it("Should insert a child node", () => {
      component.insertNode(component.dataTree[0], new TreeNode());
      expect(component.dataTree.length).toEqual(1);
      expect(component.dataTree[0].children.length).toEqual(3);
    });
  });
  describe("#removeNode()", () => {
    it("Should remove node on top level", () => {
      component.removeNode(null, component.dataTree[0]);
      expect(component.dataTree.length).toEqual(0);
    });
    it("Should remove  child node", () => {
      component.removeNode(
        component.dataTree[0],
        component.dataTree[0].children[0],
      );
      expect(component.dataTree[0].children.length).toEqual(1);
    });
  });
  describe("#getIndex()", () => {
    it("Should get current index of the node on top level", () => {
      const index = component.getIndex(null, component.dataTree[0]);
      expect(index).toEqual(0);
    });
    it("Should get current index of the child node", () => {
      const index = component.getIndex(
        component.dataTree[0],
        component.dataTree[0].children[1],
      );
      expect(index).toEqual(1);
    });
  });
  describe("#getValueRepresentation()", () => {
    it("Should get string null", () => {
      component.metadata = {
        barCode: null,
      };
      component.ngOnInit();
      const result = component.getValueRepresentation(
        component.treeControl.dataNodes[0],
      );
      expect(result).toEqual("null");
    });
    it("Should get string undefined", () => {
      component.metadata = {
        barCode: undefined,
      };
      component.ngOnInit();
      const result = component.getValueRepresentation(
        component.treeControl.dataNodes[0],
      );
      expect(result).toEqual("undefined");
    });
    it("Should get string []", () => {
      component.metadata = {
        barCode: [],
      };
      component.ngOnInit();
      const result = component.getValueRepresentation(
        component.treeControl.dataNodes[0],
      );
      expect(result).toEqual("[ ]");
    });

    it('Should get string "" ', () => {
      component.metadata = {
        barCode: "",
      };
      component.ngOnInit();
      const result = component.getValueRepresentation(
        component.treeControl.dataNodes[0],
      );
      expect(result).toEqual('""');
    });
    it("Should get value and symbol Å ", () => {
      component.metadata = {
        wavelength: {
          value: 1,
          unit: "angstrom",
        },
      };
      component.ngOnInit();
      const result = component.getValueRepresentation(
        component.treeControl.dataNodes[0],
      );
      expect(result).toEqual("1 (Å)");
    });
    it("Should get date string ", () => {
      component.metadata = {
        creationTime: DateTime.fromISO("2016-05-25T00:00:00.000")
          .toUTC()
          .toISO(),
      };
      component.ngOnInit();
      const result = component.getValueRepresentation(
        component.treeControl.dataNodes[0],
      );
      //Difficult to verify the whole string at once due to timezone
      expect(result).toContain("2016-05-25,");
      expect(result).toContain("00:00:00");
      expect(result).toContain("GMT");
    });
  });
});
