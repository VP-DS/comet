import { BlocksBlock, PropsWithData, SupportedBlocks } from "@comet/cms-site";
import { PageContentBlockData } from "@src/blocks.generated";
import * as React from "react";

import { AnchorBlock } from "./AnchorBlock";
import { ColumnsBlock } from "./ColumnsBlock";
import { DamImageBlock } from "./DamImageBlock";
import DamVideoBlock from "./DamVideoBlock";
import { FullWidthImageBlock } from "./FullWidthImageBlock";
import { HeadlineBlock } from "./HeadlineBlock";
import { LinkListBlock } from "./LinkListBlock";
import RichTextBlock from "./RichTextBlock";
import SpaceBlock from "./SpaceBlock";
import { TextImageBlock } from "./TextImageBlock";
import YouTubeVideoBlock from "./YouTubeVideoBlock";

const supportedBlocks: SupportedBlocks = {
    space: (props) => <SpaceBlock data={props} />,
    richtext: (props) => <RichTextBlock data={props} />,
    headline: (props) => <HeadlineBlock data={props} />,
    image: (props) => <DamImageBlock data={props} />,
    textImage: (props) => <TextImageBlock data={props} />,
    damVideo: (props) => <DamVideoBlock data={props} />,
    youTubeVideo: (props) => <YouTubeVideoBlock data={props} />,
    linkList: (props) => <LinkListBlock data={props} />,
    fullWidthImage: (props) => <FullWidthImageBlock data={props} />,
    columns: (props) => <ColumnsBlock data={props} />,
    anchor: (props) => <AnchorBlock data={props} />,
};

export const PageContentBlock: React.FC<PropsWithData<PageContentBlockData>> = ({ data }) => {
    return <BlocksBlock data={data} supportedBlocks={supportedBlocks} />;
};
