// TypeScript declarations for Electron webview tag
declare namespace ElectronWebViewTag {
    interface WebviewTag extends HTMLElement {
        src?: string;
        allowpopups?: boolean | string;
        partition?: string;
        preload?: string;
        useragent?: string;
        nodeintegration?: boolean | string;
        plugins?: boolean | string;
        disablewebsecurity?: boolean | string;
        webpreferences?: string;

        // DevTools methods
        openDevTools(): void;
        closeDevTools(): void;
        isDevToolsOpened(): boolean;
        inspectElement(x: number, y: number): void;
        reload(): void;

        // Navigation methods
        goBack(): void;
        goForward(): void;
        canGoBack(): boolean;
        canGoForward(): boolean;
        getURL(): string;
    }
}

declare namespace JSX {
    interface IntrinsicElements {
        webview: React.DetailedHTMLProps<
            React.HTMLAttributes<ElectronWebViewTag.WebviewTag> & {
                src?: string;
                allowpopups?: boolean | string;
                partition?: string;
                preload?: string;
                useragent?: string;
                nodeintegration?: boolean | string;
                plugins?: boolean | string;
                disablewebsecurity?: boolean | string;
                webpreferences?: string;
            },
            ElectronWebViewTag.WebviewTag
        >;
    }
}
