import { createSlice } from "@reduxjs/toolkit";
import { globalStates as GlobalState } from "./states/globalState";
import { globalAction  as GlobalAction} from "./actions/globalAction";



export const globalSlices = createSlice({
    name : 'global',
    initialState:GlobalState,
    reducers :GlobalAction
})

export const globalAction = globalSlices.actions
export default globalSlices.reducer