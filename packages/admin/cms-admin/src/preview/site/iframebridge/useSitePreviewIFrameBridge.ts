import * as React from "react";

import { SitePreviewIFrameMessage, SitePreviewIFrameMessageType } from "./SitePreviewIFrameMessage";

export function useSitePreviewIFrameBridge(onReceiveMessage: (message: SitePreviewIFrameMessage) => void) {
    React.useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            let message;
            try {
                message = JSON.parse(event.data);
            } catch (e) {
                // empty
            }
            // Check if message is an iframe message from us -> there are more messaging from e.g webpack,etc.
            if (
                message &&
                Object.prototype.hasOwnProperty.call(message, "cometType") &&
                (message.cometType == SitePreviewIFrameMessageType.OpenLink || message.cometType == SitePreviewIFrameMessageType.SitePreviewLocation)
            ) {
                onReceiveMessage(message as SitePreviewIFrameMessage);
            }
        };

        window.addEventListener("message", handleMessage, false);

        return () => {
            window.removeEventListener("message", handleMessage, false);
        };
    }, [onReceiveMessage]);
}
