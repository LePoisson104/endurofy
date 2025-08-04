import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/lib/store";

interface Settings {
  theme: string;
  created_at: string;
  updated_at: string;
}

const initialState: Settings = {
  theme: "",
  created_at: "",
  updated_at: "",
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<Settings>) => {
      Object.assign(state, action.payload);
    },
    resetSettings: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const { setSettings } = settingsSlice.actions;
export const selectSettings = (state: RootState) => state.settings;

export default settingsSlice.reducer;
