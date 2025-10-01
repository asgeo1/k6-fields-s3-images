import _objectSpread from '@babel/runtime/helpers/esm/objectSpread2';
import _objectWithoutProperties from '@babel/runtime/helpers/esm/objectWithoutProperties';

const _excluded = ["size"];
const IMAGE_REGEX = /^s3:image:([^\\\/:\n]+)\.(gif|jpg|png|webp):(sm|md|lg|full)$/;
const IMAGES_META_REGEX = /^s3:images:([^\\\/:\n]+):([^\\\/:\n]+)$/;
const SUPPORTED_IMAGE_EXTENSIONS = ['jpg', 'png', 'webp', 'gif'];
const ALIAS_IMAGE_EXTENSIONS_MAP = {
  'jpeg': 'jpg'
};
const getImageMetaRef = (id, sizesMeta) => {
  const meta = Buffer.from(JSON.stringify(sizesMeta)).toString('base64');
  return `s3:images:${id}:${meta}`;
};
const parseImagesMetaRef = ref => {
  const match = ref.match(IMAGES_META_REGEX);
  if (match) {
    const [, id, meta] = match;
    try {
      const sizesMeta = JSON.parse(Buffer.from(meta, 'base64').toString());
      const _sizesMeta$full = sizesMeta.full,
        {
          size
        } = _sizesMeta$full,
        data = _objectWithoutProperties(_sizesMeta$full, _excluded);
      return _objectSpread(_objectSpread({
        id
      }, data), {}, {
        sizesMeta
      });
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }
  return undefined;
};
const getImageRef = (id, size, extension) => `s3:image:${id}.${extension}:${size}`;
const parseImageRef = ref => {
  const match = ref.match(IMAGE_REGEX);
  if (match) {
    const [, id, ext, size] = match;
    return {
      id,
      extension: ext,
      size: size
    };
  }
  return undefined;
};
const extensionsSet = new Set(SUPPORTED_IMAGE_EXTENSIONS);
const isValidImageExtension = extension => {
  return extensionsSet.has(extension);
};
const normalizeImageExtension = extension => {
  if (isValidImageExtension(extension)) {
    return extension;
  }
  return ALIAS_IMAGE_EXTENSIONS_MAP[extension] || undefined;
};

export { SUPPORTED_IMAGE_EXTENSIONS as S, parseImageRef as a, getImageRef as b, getImageMetaRef as g, isValidImageExtension as i, normalizeImageExtension as n, parseImagesMetaRef as p };
