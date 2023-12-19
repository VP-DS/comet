import * as React from "react";

export interface TranslationConfig {
    enabled: boolean;
    translate: (input: string) => Promise<string>;
}

export const ContentTranslationServiceContext = React.createContext<TranslationConfig>({
    enabled: false,
    translate: async (input) => input,
});
