import { Field, FinalForm, FinalFormInput, RouterTab, RouterTabs, SnackbarProvider, Stack, StackLink, StackPage, StackSwitch } from "@comet/admin";
import { AdminComponentRoot, createBlocksBlock, createFinalFormBlock, SpaceBlock } from "@comet/blocks-admin";
import { createLinkBlock, createRichTextBlock, DamImageBlock, ExternalLinkBlock, InternalLinkBlock } from "@comet/cms-admin";
import { Button } from "@mui/material";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useLocation } from "react-router";

import { storyRouterDecorator } from "../../story-router.decorator";

const LinkBlock = createLinkBlock({ supportedBlocks: { internal: InternalLinkBlock, external: ExternalLinkBlock } });
const RichTextBlock = createRichTextBlock({ link: LinkBlock });
const BlocksBlock = createBlocksBlock({ name: "BlocksBlock", supportedBlocks: { space: SpaceBlock, image: DamImageBlock, richtext: RichTextBlock } });
const FinalFormBlocksBlock = createFinalFormBlock(BlocksBlock);

const initialValues = {
    foo: "foo",
    bar: "bar",
    content: BlocksBlock.defaultValues(),
};

function Path() {
    const location = useLocation();
    const [, rerender] = React.useState(0);
    React.useEffect(() => {
        const timer = setTimeout(() => {
            rerender(new Date().getTime());
        }, 1000);
        return () => clearTimeout(timer);
    }, []);
    return <div>{location.pathname}</div>;
}

function Story() {
    return (
        <>
            <DndProvider backend={HTML5Backend}>
                <SnackbarProvider>
                    <Path />
                    <FinalForm
                        mode="edit"
                        onSubmit={(values: any) => {
                            alert(JSON.stringify(values));
                        }}
                        initialValues={initialValues}
                    >
                        {() => (
                            <RouterTabs>
                                <RouterTab label="Form 1" path="" forceRender={true}>
                                    <Field label="Foo" name="foo" component={FinalFormInput} />
                                </RouterTab>
                                <RouterTab label="Form 2" path="/form2" forceRender={true}>
                                    <Field label="Bar" name="bar" component={FinalFormInput} />
                                    <Stack topLevelTitle="">
                                        <StackSwitch initialPage="page1">
                                            <StackPage name="page1">
                                                Form 2 Subpage 1
                                                <StackLink pageName="page2" payload="test">
                                                    <Button>To subpage 2</Button>
                                                </StackLink>
                                                <AdminComponentRoot>
                                                    <Field label="BlocksBlock" name="content" fullWidth component={FinalFormBlocksBlock} />
                                                </AdminComponentRoot>
                                            </StackPage>
                                            <StackPage name="page2">
                                                Form 2 Subpage 2
                                                <StackLink pageName="page1" payload="test">
                                                    <Button>To subpage 1</Button>
                                                </StackLink>
                                            </StackPage>
                                        </StackSwitch>
                                    </Stack>
                                </RouterTab>
                            </RouterTabs>
                        )}
                    </FinalForm>
                </SnackbarProvider>
            </DndProvider>
        </>
    );
}
storiesOf("@comet/admin/form", module)
    .addDecorator(storyRouterDecorator())
    .add("RouterTabsInFormWithBlocksAndSubroutes", () => <Story />);
