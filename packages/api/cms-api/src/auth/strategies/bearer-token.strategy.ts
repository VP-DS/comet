import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import http, { Agent } from "http";
import https from "https";
import NodeCache from "node-cache";
import fetch from "node-fetch";
import { Strategy } from "passport-http-bearer";
import { URLSearchParams } from "url";

import { AUTH_CONFIG, AUTH_CURRENT_USER_LOADER } from "../auth.constants";
import { AuthConfig } from "../auth.module";
import { CurrentUser } from "../dto/current-user";
import { CurrentUserLoaderInterface } from "../interfaces/current-user-loader.interface";

@Injectable()
export class BearerTokenStrategy extends PassportStrategy(Strategy) {
    private validatedUserCache: NodeCache;
    private httpAgent: Agent;
    constructor(
        @Inject(forwardRef(() => AUTH_CONFIG)) private readonly config: AuthConfig,
        @Inject(AUTH_CURRENT_USER_LOADER) private readonly currentUserLoader: CurrentUserLoaderInterface,
    ) {
        super();
        this.validatedUserCache = new NodeCache();
        const Agent = this.config.idpConfig.url.startsWith("http:") ? http.Agent : https.Agent;
        this.httpAgent = new Agent({
            keepAlive: true,
        });
    }

    async validate(token: string): Promise<CurrentUser | null | undefined> {
        let validatedUser: CurrentUser | null | undefined = this.validatedUserCache.get(token);
        if (validatedUser === undefined) {
            validatedUser = await this.getValidatedUser(token);
            this.validatedUserCache.set(token, validatedUser, 60);
        }
        return validatedUser;
    }

    async getValidatedUser(token: string): Promise<CurrentUser | null> {
        const headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Forwarded-Proto": "https",
        };
        if (this.config.idpConfig.password) {
            Object.assign(headers, { Authorization: `Basic ${Buffer.from(`vivid:${this.config.idpConfig.password}`).toString("base64")}` });
        }
        const response = await fetch(`${this.config.idpConfig.url}/oauth2/introspect`, {
            method: "POST",
            headers,
            agent: this.httpAgent,
            body: new URLSearchParams({ token, client_id: this.config.idpConfig.clientId }).toString(), // client_id should not be necessary but oidc-provider needs it
        });

        if (response.status !== 200) return null;

        const data = await response.json();

        if (!data || !data.active) return null;
        if (data.client_id !== this.config.idpConfig.clientId) return null;

        return this.currentUserLoader.load(token, data);
    }
}