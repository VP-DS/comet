import FormatListBulletedIcon from "@material-ui/icons/FormatListBulleted";
import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
import * as React from "react";
import { defineMessage, FormattedMessage } from "react-intl";

import { BlockElement } from "./BlockElement";
import { IBlocktypeConfig, IBlocktypeMap } from "./types";

const headerMessage = defineMessage({ id: "cometAdmin.rte.controls.blockType.heading", defaultMessage: "Heading {level}" });

const defaultBlocktypeMap: IBlocktypeMap = {
    // "unstyled" is special: only the value for renderConfig and label is considered,
    // other values are ignored
    unstyled: {
        //info:  https://draftjs.org/docs/advanced-topics-custom-block-render-map/#configuring-block-render-map
        renderConfig: {
            element: BlockElement,
            aliasedElements: ["p"],
        },
    },
    "header-one": {
        supportedBy: "header-one",
        label: <FormattedMessage {...headerMessage} values={{ level: 1 }} />,
        group: "dropdown",
        renderConfig: {
            element: (p) => <BlockElement type="header-one" variant="h1" {...p} />,
            aliasedElements: ["h1"], // important for matching tags when "word-content" is pasted into rte
        },
    },
    "header-two": {
        supportedBy: "header-two",
        label: <FormattedMessage {...headerMessage} values={{ level: 2 }} />,
        group: "dropdown",
        renderConfig: {
            element: (p) => <BlockElement type="header-two" variant="h2" {...p} />,
            aliasedElements: ["h2"],
        },
    },
    "header-three": {
        supportedBy: "header-three",
        label: <FormattedMessage {...headerMessage} values={{ level: 3 }} />,
        group: "dropdown",
        renderConfig: {
            element: (p) => <BlockElement type="header-three" variant="h3" {...p} />,
            aliasedElements: ["h3"],
        },
    },
    "header-four": {
        supportedBy: "header-four",
        label: <FormattedMessage {...headerMessage} values={{ level: 4 }} />,
        group: "dropdown",
        renderConfig: {
            element: (p) => <BlockElement type="header-four" variant="h4" {...p} />,
            aliasedElements: ["h4"],
        },
    },
    "header-five": {
        supportedBy: "header-five",
        label: <FormattedMessage {...headerMessage} values={{ level: 5 }} />,
        group: "dropdown",
        renderConfig: {
            element: (p) => <BlockElement type="header-five" variant="h5" {...p} />,
            aliasedElements: ["h5"],
        },
    },
    "header-six": {
        supportedBy: "header-six",
        label: <FormattedMessage {...headerMessage} values={{ level: 6 }} />,
        group: "dropdown",
        renderConfig: {
            element: (p) => <BlockElement type="header-six" variant="h6" {...p} />,
            aliasedElements: ["h6"],
        },
    },
    blockquote: {
        supportedBy: "blockquote",
        label: <FormattedMessage id="cometAdmin.rte.controls.blockType.blockquote" defaultMessage="Blockquote" />,
        renderConfig: {
            element: (p) => <BlockElement type="blockquote" {...p} />,
            aliasedElements: ["blockquote"],
        },
    },
    "unordered-list-item": {
        supportedBy: "unordered-list",
        group: "button",
        label: <FormattedMessage id="cometAdmin.rte.controls.blockType.unorderedList" defaultMessage="Bulletpoints" />,
        icon: FormatListBulletedIcon,
        renderConfig: {
            wrapper: <BlockElement type="unordered-list" component="ul" />,
            element: "li", // Do not change this to a react component (<Typography {...p}/>) unless you implement the css for nesting lists yourself!
            // This css is used by default and it handles the nesting: https://github.com/facebook/draft-js/blob/master/src/component/utils/DraftStyleDefault.css#L152
            // But for this css to be applied "element" needs to be an (undecorated) li-element
        },
    },
    "ordered-list-item": {
        supportedBy: "ordered-list",
        group: "button",
        label: <FormattedMessage id="cometAdmin.rte.controls.blockType.orderedList" defaultMessage="Numbering" />,
        icon: FormatListNumberedIcon,
        renderConfig: {
            wrapper: <BlockElement type="ordered-list" component="ol" />,
            element: "li", // same thing that applies to unordered-list-item applies here too!
        },
    },
};

export function mergeBlocktypeMaps(...args: IBlocktypeMap[]) {
    return args.reduce((a, b) => {
        const remaining = { ...b }; // copy or bad things happen
        const newEl: IBlocktypeMap = {};
        Object.entries(a).forEach(([key, c]) => {
            if (remaining[key]) {
                // merge 2nd level
                newEl[key] = { ...c, ...remaining[key] };
                delete remaining[key];
            } else {
                newEl[key] = { ...c }; // only one level
            }
        });
        // merge in remaining
        Object.entries(remaining).forEach(([key, c]) => {
            newEl[key] = { ...c };
        });
        return newEl;
    }); // merge 2 levels nested
}

export function checkBlocktypeMap(map: IBlocktypeMap): void {
    const unsupportedKeysForUnstyled: Array<keyof IBlocktypeConfig> = ["group", "icon", "supportedBy"];

    if (map?.unstyled) {
        unsupportedKeysForUnstyled.forEach((c) => {
            if (map.unstyled[c]) {
                console.warn(
                    `'unstyled' in BlocktypeMap does not support the key '${c}' with the given value '${map.unstyled[c]}'. The value is ignored.`,
                );
            }
        });
    }
}

export default defaultBlocktypeMap;
