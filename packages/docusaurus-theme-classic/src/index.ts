/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {LoadContext, Plugin, PostCssOptions} from '@docusaurus/types';
import type {ThemeConfig} from '@docusaurus/theme-common';
import {getTranslationFiles, translateThemeConfig} from './translations';
import path from 'path';
import {createRequire} from 'module';
import type {Plugin as PostCssPlugin} from 'postcss';
import rtlcss from 'rtlcss';
import {readDefaultCodeTranslationMessages} from '@docusaurus/theme-translations';
import type {Options} from '@docusaurus/theme-classic';
import type webpack from 'webpack';

const requireFromDocusaurusCore = createRequire(
  require.resolve('@docusaurus/core/package.json'),
);
const ContextReplacementPlugin: typeof webpack.ContextReplacementPlugin =
  requireFromDocusaurusCore('webpack/lib/ContextReplacementPlugin');

// Need to be inlined to prevent dark mode FOUC
// Make sure the key is the same as the one in `/theme/hooks/useTheme.js`
const ThemeStorageKey = 'theme';
const noFlashColorMode = ({
  defaultMode,
  respectPrefersColorScheme,
}: ThemeConfig['colorMode']) => `(function() {
  var defaultMode = '${defaultMode}';
  var respectPrefersColorScheme = ${respectPrefersColorScheme};

  function setDataThemeAttribute(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  function getStoredTheme() {
    var theme = null;
    try {
      theme = localStorage.getItem('${ThemeStorageKey}');
    } catch (err) {}
    return theme;
  }

  var storedTheme = getStoredTheme();
  if (storedTheme !== null) {
    setDataThemeAttribute(storedTheme);
  } else {
    if (
      respectPrefersColorScheme &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      setDataThemeAttribute('dark');
    } else if (
      respectPrefersColorScheme &&
      window.matchMedia('(prefers-color-scheme: light)').matches
    ) {
      setDataThemeAttribute('light');
    } else {
      setDataThemeAttribute(defaultMode === 'dark' ? 'dark' : 'light');
    }
  }
})();`;

// Duplicated constant. Unfortunately we can't import it from theme-common, as
// we need to support older nodejs versions without ESM support
// TODO: import from theme-common once we only support Node.js with ESM support
// + move all those announcementBar stuff there too
export const AnnouncementBarDismissStorageKey =
  'docusaurus.announcement.dismiss';
const AnnouncementBarDismissDataAttribute =
  'data-announcement-bar-initially-dismissed';
// We always render the announcement bar html on the server, to prevent layout
// shifts on React hydration. The theme can use CSS + the data attribute to hide
// the announcement bar asap (before React hydration)
const AnnouncementBarInlineJavaScript = `
(function() {
  function isDismissed() {
    try {
      return localStorage.getItem('${AnnouncementBarDismissStorageKey}') === 'true';
    } catch (err) {}
    return false;
  }
  document.documentElement.setAttribute('${AnnouncementBarDismissDataAttribute}', isDismissed());
})();`;

function getInfimaCSSFile(direction: string) {
  return `infima/dist/css/default/default${
    direction === 'rtl' ? '-rtl' : ''
  }.css`;
}

export default function docusaurusThemeClassic(
  context: LoadContext,
  options: Options,
): Plugin<void> {
  const {
    siteConfig: {themeConfig: roughlyTypedThemeConfig},
    i18n: {currentLocale, localeConfigs},
  } = context;
  const themeConfig = (roughlyTypedThemeConfig || {}) as ThemeConfig;
  const {
    announcementBar,
    colorMode,
    prism: {additionalLanguages = []} = {},
  } = themeConfig;
  const {customCss} = options || {};
  const {direction} = localeConfigs[currentLocale];

  return {
    name: 'docusaurus-theme-classic',

    getThemePath() {
      return path.join(__dirname, '../lib-next/theme');
    },

    getTypeScriptThemePath() {
      return path.resolve(__dirname, '../src/theme');
    },

    getTranslationFiles: async () => getTranslationFiles({themeConfig}),

    translateThemeConfig: (params) =>
      translateThemeConfig({
        themeConfig: params.themeConfig as ThemeConfig,
        translationFiles: params.translationFiles,
      }),

    getDefaultCodeTranslationMessages() {
      return readDefaultCodeTranslationMessages({
        locale: currentLocale,
        name: 'theme-common',
      });
    },

    getClientModules() {
      const modules = [
        require.resolve(getInfimaCSSFile(direction)),
        path.resolve(__dirname, './prism-include-languages'),
        path.resolve(__dirname, './admonitions.css'),
      ];

      if (customCss) {
        if (Array.isArray(customCss)) {
          modules.push(...customCss);
        } else {
          modules.push(customCss);
        }
      }

      return modules;
    },

    configureWebpack() {
      const prismLanguages = additionalLanguages
        .map((lang) => `prism-${lang}`)
        .join('|');

      return {
        plugins: [
          // This allows better optimization by only bundling those components
          // that the user actually needs, because the modules are dynamically
          // required and can't be known during compile time.
          new ContextReplacementPlugin(
            /prismjs[\\/]components$/,
            new RegExp(`^./(${prismLanguages})$`),
          ),
        ],
      };
    },

    configurePostCss(postCssOptions: PostCssOptions) {
      if (direction === 'rtl') {
        const resolvedInfimaFile = require.resolve(getInfimaCSSFile(direction));
        const plugin: PostCssPlugin = {
          postcssPlugin: 'RtlCssPlugin',
          prepare: (result) => {
            const file = result.root?.source?.input?.file;
            // Skip Infima as we are using the its RTL version.
            if (file === resolvedInfimaFile) {
              return {};
            }
            return rtlcss(result.root as unknown as rtlcss.ConfigOptions);
          },
        };
        postCssOptions.plugins.push(plugin);
      }

      return postCssOptions;
    },

    injectHtmlTags() {
      return {
        preBodyTags: [
          {
            tagName: 'script',
            innerHTML: `
${noFlashColorMode(colorMode)}
${announcementBar ? AnnouncementBarInlineJavaScript : ''}
            `,
          },
        ],
      };
    },
  };
}

export {default as getSwizzleConfig} from './getSwizzleConfig';
export {validateThemeConfig} from './validateThemeConfig';
