import axios from 'axios';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';

interface CastState {
    castsLoading: 'idle' | 'fulfilled' | 'pending' | 'rejected';
    casts: any[]; // replace "any" with casts type
}

const initialState: CastState = {
    castsLoading: 'idle',
    casts: []
};

export const getCasts = createAsyncThunk<any, void>('casts/getCasts', async () => {
    
});  

const castsSlice = createSlice({
    name: 'casts',
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(getCasts.fulfilled, (state: CastState, action: PayloadAction<any>) => {
        state.castsLoading = 'fulfilled'
        state.casts = action.payload
      })
    },
  });
  
export default castsSlice.reducer;