import { gql, useApolloClient } from "@apollo/client";
import { Field, FieldContainer, FinalFormInput, FinalFormSelect, FormSection } from "@comet/admin";
import { FinalFormDatePicker } from "@comet/admin-date-time";
import { Calendar } from "@comet/admin-icons";
import { InputAdornment } from "@mui/material";
import { styled } from "@mui/material/styles";
import * as React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { GQLDamIsFilenameOccupiedQuery, GQLDamIsFilenameOccupiedQueryVariables, GQLLicenseType } from "../../graphql.generated";
import { CropSettingsFields } from "./CropSettingsFields";
import { EditFileFormValues } from "./EditFile";

interface SettingsFormProps {
    isImage: boolean;
    folderId: string | null;
}

const damIsFilenameOccupiedQuery = gql`
    query DamIsFilenameOccupied($filename: String!, $folderId: String) {
        damIsFilenameOccupied(filename: $filename, folderId: $folderId)
    }
`;

export type LicenseType = GQLLicenseType | "NO_LICENSE";

const licenseTypeArray: readonly LicenseType[] = ["NO_LICENSE", "ROYALTY_FREE", "RIGHTS_MANAGED", "SUBSCRIPTION", "MICRO"];

const licenseTypeLabels: { [key in LicenseType]: React.ReactNode } = {
    NO_LICENSE: "-",
    ROYALTY_FREE: <FormattedMessage id="comet.dam.file.licenseType.royaltyFree" defaultMessage="Royalty free" />,
    RIGHTS_MANAGED: <FormattedMessage id="comet.dam.file.licenseType.rightsManaged" defaultMessage="Rights managed" />,
    SUBSCRIPTION: <FormattedMessage id="comet.dam.file.licenseType.subscription" defaultMessage="Subscription" />,
    MICRO: <FormattedMessage id="comet.dam.file.licenseType.micro" defaultMessage="Micro" />,
};

export const FileSettingsFields = ({ isImage, folderId }: SettingsFormProps): React.ReactElement => {
    const intl = useIntl();
    const apollo = useApolloClient();
    const damIsFilenameOccupied = React.useCallback(
        async (filename: string): Promise<boolean> => {
            const { data } = await apollo.query<GQLDamIsFilenameOccupiedQuery, GQLDamIsFilenameOccupiedQueryVariables>({
                query: damIsFilenameOccupiedQuery,
                variables: {
                    filename,
                    folderId,
                },
                fetchPolicy: "network-only",
            });

            return data.damIsFilenameOccupied;
        },
        [apollo, folderId],
    );

    return (
        <div>
            <FormSection title="General">
                <Field
                    label={intl.formatMessage({
                        id: "comet.dam.file.fileName",
                        defaultMessage: "File Name",
                    })}
                    name="name"
                    component={FinalFormInput}
                    validate={async (value, allValues, meta) => {
                        if (value && meta?.dirty) {
                            if (await damIsFilenameOccupied(value)) {
                                return intl.formatMessage({
                                    id: "comet.dam.file.validate.filename.error",
                                    defaultMessage: "Filename already exists",
                                });
                            }
                        }
                    }}
                    fullWidth
                />
            </FormSection>
            {isImage && <CropSettingsFields />}
            <FormSection title={intl.formatMessage({ id: "comet.dam.file.seo", defaultMessage: "SEO" })}>
                <Field
                    label={intl.formatMessage({
                        id: "comet.dam.file.altText",
                        defaultMessage: "Alternative Text",
                    })}
                    name="altText"
                    component={FinalFormInput}
                    fullWidth
                />
                <Field
                    label={intl.formatMessage({
                        id: "comet.dam.file.title",
                        defaultMessage: "Title",
                    })}
                    name="title"
                    component={FinalFormInput}
                    fullWidth
                />
            </FormSection>
            <FormSection title={<FormattedMessage id="comet.dam.file.licenseInformation" defaultMessage="License information" />}>
                <Field
                    component={FinalFormSelect}
                    options={licenseTypeArray}
                    getOptionLabel={(option: LicenseType) => licenseTypeLabels[option]}
                    getOptionSelected={(option: LicenseType, selectedOption: LicenseType) => {
                        return option === selectedOption;
                    }}
                    name="license.type"
                    label={<FormattedMessage id="comet.dam.file.type" defaultMessage="Type" />}
                    fullWidth
                />
                <Field name="license.type">
                    {({ input: { value } }) => {
                        return (
                            <>
                                <Field
                                    label={<FormattedMessage id="comet.dam.file.licenseDetails" defaultMessage="License details" />}
                                    name="license.details"
                                    component={FinalFormInput}
                                    multiline
                                    minRows={3}
                                    fullWidth
                                    disabled={value === "NO_LICENSE"}
                                />
                                <Field
                                    label={<FormattedMessage id="comet.dam.file.creatorOrAuthor" defaultMessage="Creator/Author" />}
                                    name="license.author"
                                    component={FinalFormInput}
                                    fullWidth
                                    disabled={value === "NO_LICENSE"}
                                />
                                <FieldContainer
                                    label={<FormattedMessage id="comet.dam.file.licenseDuration" defaultMessage="License duration" />}
                                    fullWidth
                                    disabled={value === "NO_LICENSE"}
                                >
                                    <DurationFieldWrapper>
                                        <Field
                                            name="license.durationFrom"
                                            placeholder="from"
                                            component={FinalFormDatePicker}
                                            clearable
                                            startAdornment={null}
                                            endAdornment={
                                                <InputAdornment position="start">
                                                    <Calendar />
                                                </InputAdornment>
                                            }
                                            disabled={value === "NO_LICENSE"}
                                        />
                                        <Field
                                            name="license.durationTo"
                                            placeholder="to"
                                            component={FinalFormDatePicker}
                                            clearable
                                            startAdornment={null}
                                            endAdornment={
                                                <InputAdornment position="start">
                                                    <Calendar />
                                                </InputAdornment>
                                            }
                                            validate={(value: Date | undefined, allValues) => {
                                                if (value && allValues && value < (allValues as EditFileFormValues).license?.durationFrom) {
                                                    return (
                                                        <FormattedMessage
                                                            id="comet.dam.file.error.durationTo"
                                                            defaultMessage="The end date of the license must be after the start date"
                                                        />
                                                    );
                                                }
                                            }}
                                            disabled={value === "NO_LICENSE"}
                                        />
                                    </DurationFieldWrapper>
                                </FieldContainer>
                            </>
                        );
                    }}
                </Field>
            </FormSection>
        </div>
    );
};

const DurationFieldWrapper = styled("div")`
    display: flex;
`;
