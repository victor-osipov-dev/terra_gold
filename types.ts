import { Context } from "telegraf";

export interface SessionData {
    state?: {
        type: "deposit";
    };
}

export interface MyContext extends Context {
    session: SessionData;
}
