/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export {
  NODE_MAJOR_VERSION,
  NODE_MINOR_VERSION,
  DEFAULT_BUILD_DIR_NAME,
  DEFAULT_CONFIG_FILE_NAME,
  BABEL_CONFIG_FILE_NAME,
  GENERATED_FILES_DIR_NAME,
  SRC_DIR_NAME,
  STATIC_DIR_NAME,
  OUTPUT_STATIC_ASSETS_DIR_NAME,
  THEME_PATH,
  DEFAULT_PORT,
  DEFAULT_PLUGIN_ID,
  WEBPACK_URL_LOADER_LIMIT,
} from './constants';
export {generate, genChunkName, readOutputHTMLFile} from './emitUtils';
export {getFileCommitDate, GitNotFoundError} from './gitUtils';
export {
  mergeTranslations,
  updateTranslationFileMessages,
  getPluginI18nPath,
} from './i18nUtils';
export {
  removeSuffix,
  removePrefix,
  getElementsAround,
  mapAsyncSequential,
  findAsyncSequential,
  reportMessage,
} from './jsUtils';
export {
  normalizeUrl,
  getEditUrl,
  fileToPath,
  encodePath,
  isValidPathname,
  resolvePathname,
  addLeadingSlash,
  addTrailingSlash,
  removeTrailingSlash,
} from './urlUtils';
export {
  type Tag,
  type FrontMatterTag,
  type TaggedItemGroup,
  normalizeFrontMatterTag,
  normalizeFrontMatterTags,
  groupTaggedItems,
} from './tags';
export {
  parseMarkdownHeadingId,
  createExcerpt,
  parseFrontMatter,
  parseMarkdownContentTitle,
  parseMarkdownString,
} from './markdownParser';
export {
  type ContentPaths,
  type BrokenMarkdownLink,
  type ReplaceMarkdownLinksParams,
  type ReplaceMarkdownLinksReturn,
  replaceMarkdownLinks,
} from './markdownLinks';
export {type SluggerOptions, type Slugger, createSlugger} from './slugger';
export {
  isNameTooLong,
  shortName,
  posixPath,
  toMessageRelativeFilePath,
  aliasedSitePath,
  escapePath,
  addTrailingPathSeparator,
} from './pathUtils';
export {md5Hash, simpleHash, docuHash} from './hashUtils';
export {
  Globby,
  GlobExcludeDefault,
  createMatcher,
  createAbsoluteFilePathMatcher,
} from './globUtils';
export {getFileLoaderUtils} from './webpackUtils';
export {
  getDataFilePath,
  getDataFileData,
  getContentPathList,
  findFolderContainingFile,
  getFolderContainingFile,
} from './dataFileUtils';
