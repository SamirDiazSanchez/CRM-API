import { UserModel } from "./userModel";

export interface AuthModel {
	token: string,
	refresh_token: string,
	user: UserModel
}