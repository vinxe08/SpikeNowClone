import { combineReducers, configureStore } from "@reduxjs/toolkit";
// import counterReducer from "../features/counter/counterSlice";
import loginReducer from "../features/login/loginSlice";
import emailReducer from "../features/email/emailSlice";
import showReducer from "../features/show/showSlice";
import videoChatReducer from "../features/videochat/videochatSlice";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";
import thunk from "redux-thunk";
import persistStore from "redux-persist/es/persistStore";

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  loginReducer,
  emailReducer,
  showReducer,
  videoChatReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: [thunk],
});

export const persistor = persistStore(store);
