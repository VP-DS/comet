import { IntrospectionQuery } from "graphql";

import { GeneratorOptions } from "./generate";
import { writeGenerated } from "./utils/write-generated";

export async function writeCrudPage(targetDirectory: string, schema: IntrospectionQuery, { entityName }: GeneratorOptions): Promise<void> {
    const out = `
        import { Stack, StackPage, StackSwitch } from "@comet/admin";
        import * as React from "react";
        import { useIntl } from "react-intl";

        import { ${entityName}Form } from "./${entityName}Form";
        import { ${entityName}sGrid } from "./${entityName}sGrid";

        export function ${entityName}sPage(): React.ReactElement {
            const intl = useIntl();

            return (
                <Stack topLevelTitle="${entityName}s">
                    <StackSwitch>
                        <StackPage name="grid">
                            <${entityName}sGrid />
                        </StackPage>
                        <StackPage name="edit" title={intl.formatMessage({ id: "starter.common.edit", defaultMessage: "bearbeiten" })}>
                            {(selectedId) => <${entityName}Form id={selectedId} />}
                        </StackPage>
                        <StackPage name="add" title={intl.formatMessage({ id: "starter.common.add", defaultMessage: "hinzufügen" })}>
                            <${entityName}Form />
                        </StackPage>
                    </StackSwitch>
                </Stack>
            );
        }
    `;
    writeGenerated(`${targetDirectory}/${entityName}sPage.tsx`, out);
}
