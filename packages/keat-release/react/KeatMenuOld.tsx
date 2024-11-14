import { Command } from 'cmdk';
import React, { useCallback, useEffect } from 'react';
import { ConnectScreen } from './screens/0-Connect';
import { BrowseScreen } from './screens/1-Browse';
import { ToggleScreen } from './screens/2-Toggle';
import { ConfirmScreen } from './screens/3-Confirm';
import { KeatProvider, useKeatContext } from './KeatContext';
import { SettingsScreen } from './screens/10-Settings';
import { WebDialog } from 'web-dialog';

// https://github.com/web-padawan/awesome-web-components
// https://github.com/andreasbm/web-dialog/tree/master?tab=readme-ov-file#-extend-webdialog
// deprecated https://github.com/github/github-elements?tab=readme-ov-file
// https://primer.style/components/dialog

// using built-in dialog
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog
// https://web.dev/articles/building/a-dialog-component

// Create a template for the content of the dialog
const $template = document.createElement('template');
$template.innerHTML = `
  <style>
    #img {
      width: 100%;
      height: 400px;
      object-fit: cover;
    }
  </style>
  <img id="img" />
`;

type Props = {
    // The hotkey to open Keat Menu.
    hotkey?: string;
};

export function KeatMenu(props: Props) {
    return (
        <KeatProvider>
            <KeatDialog {...props} />
        </KeatProvider>
    );
}

export function KeatDialog({ hotkey = '¶' }: Props) {
    const { screen, reset } = useKeatContext();
    const [open, setOpen] = React.useState(false);

    useEffect(() => {
        const down = (e: any) => {
            if (e.key === hotkey) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const toggle = useCallback(
        (s: boolean) => {
            setOpen(s);
            if (s === false) {
                reset();
            }
        },
        [setOpen]
    );

    return (
        <Command.Dialog open onOpenChange={toggle} label="Keat Release">
            {screen === 'connect' ? (
                <ConnectScreen />
            ) : screen === 'browse' ? (
                <BrowseScreen />
            ) : screen === 'toggle' ? (
                <ToggleScreen />
            ) : screen === 'confirm' ? (
                <ConfirmScreen />
            ) : screen === 'settings' ? (
                <SettingsScreen />
            ) : null}
        </Command.Dialog>
    );
}
