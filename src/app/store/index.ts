import { configureStore } from "@reduxjs/toolkit";
import { globalStates } from "./states/globalState";
import  globalSlices   from "./globalSlices";

export const store = configureStore({
    reducer :{
        globalStates :globalSlices
    }
})