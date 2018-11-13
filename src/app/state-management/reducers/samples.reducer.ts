import {
  FETCH_SAMPLES,
  FETCH_SAMPLES_COMPLETE,
  FETCH_SAMPLES_FAILED,
  FetchSamplesCompleteAction,
  SamplesActions
} from "state-management/actions/samples.actions";
import { initialSampleState, SampleState } from "../state/samples.store";

export function samplesReducer(
  state: SampleState = initialSampleState,
  action: SamplesActions
): SampleState {
  if (action.type.indexOf("[Sample]") !== -1) {
    console.log("Action came in! " + action.type);
  }

  switch (action.type) {
    case FETCH_SAMPLES: {
      return { ...state, samplesLoading: true };
    }

    case FETCH_SAMPLES_COMPLETE: {
      const samples = (action as FetchSamplesCompleteAction).samples;
      return { ...state, samples, samplesLoading: false };
    }

    case FETCH_SAMPLES_FAILED: {
      return { ...state, samplesLoading: false };
    }

    default: {
      return state;
    }
  }
}
