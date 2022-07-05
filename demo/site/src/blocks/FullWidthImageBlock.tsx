import { OptionalBlock, PropsWithData, withPreview } from "@comet/cms-site";
import { FullWidthImageBlockData } from "@src/blocks.generated";
import * as React from "react";
import styled from "styled-components";

import { ImageBlock } from "./ImageBlock";
import RichTextBlock from "./RichTextBlock";

export const FullWidthImageBlock = withPreview(
    ({ data: { image, content } }: PropsWithData<FullWidthImageBlockData>) => {
        return (
            <Root>
                <ImageBlock data={image} layout="responsive" sizes="100vw" />
                <OptionalBlock
                    block={(props) => (
                        <Content>
                            <RichTextBlock data={props} />
                        </Content>
                    )}
                    data={content}
                />
            </Root>
        );
    },
    { label: "Full Width Image" },
);

const Root = styled.div`
    position: relative;
`;

const Content = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
`;