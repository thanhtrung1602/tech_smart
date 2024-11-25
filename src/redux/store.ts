import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import cookieReducer from "./cookieSlice";
import cartReducer from "./cartSlice";
import addressReducer from "./addressSlice";
import menuReducer from "./menuSlice";
import userProfileReducer from "./userProfileSlice";
export const store = configureStore({
  reducer: {
    cookie: cookieReducer,
    cart: cartReducer,
    userProfile: userProfileReducer,
    address: addressReducer,
    menu: menuReducer,
  },
  // Middleware mặc định bao gồm thunk
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware(), // Không cần thêm thunk ở đây nữa
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;