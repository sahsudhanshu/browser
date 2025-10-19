// TypeScript declarations for Electron webview tag
declare namespace JSX {
    interface IntrinsicElements {
        webview: React.DetailedHTMLProps<
            React.HTMLAttributes<HTMLElement> & {
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
            HTMLElement
        >;
    }
}
