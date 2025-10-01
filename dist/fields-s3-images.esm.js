import _objectWithoutProperties from '@babel/runtime/helpers/esm/objectWithoutProperties';
import _objectSpread from '@babel/runtime/helpers/esm/objectSpread2';
import { fieldType } from '@keystone-6/core/types';
import { graphql } from '@keystone-6/core';
import { n as normalizeImageExtension, p as parseImagesMetaRef, a as parseImageRef, S as SUPPORTED_IMAGE_EXTENSIONS, g as getImageMetaRef, b as getImageRef, i as isValidImageExtension } from './utils-bb2d4e4e.esm.js';
import { extname } from 'path';
import AWS from 'aws-sdk';
import urlJoin from 'url-join';
import cuid from 'cuid';
import sharp from 'sharp';

const _excluded$1 = ["size"],
  _excluded2 = ["size"];
function getFilename({
  id,
  size,
  extension,
  sizesMeta
}) {
  return `${id}_${size}.${extension}`;
}
function defaultGetUrl({
  bucket,
  folder
}, fileData) {
  const filename = getFilename(fileData);
  return urlJoin(`https://${bucket}.s3.amazonaws.com`, folder, filename);
}
function getUrl(config, fileData) {
  var _config$getUrl;
  fileData.size = fileData.size || config.defaultSize;
  if (fileData.size === 'base64') {
    var _fileData$sizesMeta;
    return (_fileData$sizesMeta = fileData.sizesMeta) === null || _fileData$sizesMeta === void 0 || (_fileData$sizesMeta = _fileData$sizesMeta.base64) === null || _fileData$sizesMeta === void 0 ? void 0 : _fileData$sizesMeta.base64Data;
  }
  if (config.baseUrl) {
    return urlJoin(config.baseUrl, getFilename(fileData));
  }
  return ((_config$getUrl = config.getUrl) === null || _config$getUrl === void 0 ? void 0 : _config$getUrl.call(config, config, fileData)) || defaultGetUrl(config, fileData);
}
async function getDataFromStream(config, upload, context) {
  var _config$getFilename, _config$uploadParams, _config$sizes$sm, _config$sizes, _config$sizes$md, _config$sizes2, _config$sizes$lg, _config$sizes3, _config$sizes4;
  const {
    createReadStream,
    filename: originalFilename,
    mimetype
  } = upload;
  const extension = normalizeImageExtension(extname(originalFilename).replace(/^\./, '').toLowerCase());
  const s3 = new AWS.S3(config.s3Options);
  const imagePipeline = sharp();
  createReadStream().pipe(imagePipeline);
  const metadata = await imagePipeline.metadata();
  const fileId = cuid();
  const id = ((_config$getFilename = config.getFilename) === null || _config$getFilename === void 0 ? void 0 : _config$getFilename.call(config, {
    id: fileId,
    originalFilename,
    context
  })) || fileId;
  const fileData = {
    id,
    height: metadata.height,
    width: metadata.width,
    filesize: metadata.size,
    extension,
    size: 'full'
  };
  fileData.sizesMeta = {
    full: _objectSpread({}, fileData)
  };

  // upload full image
  const uploadParams = ((_config$uploadParams = config.uploadParams) === null || _config$uploadParams === void 0 ? void 0 : _config$uploadParams.call(config, fileData)) || {};
  await s3.upload(_objectSpread({
    Body: createReadStream(),
    ContentType: mimetype,
    Bucket: config.bucket,
    Key: `${config.folder}/${getFilename(fileData)}`,
    Metadata: {
      // 'x-amz-meta-original-filename': originalFilename, // disabled per github issue #25
      'x-amz-meta-image-height': `${metadata.height}`,
      'x-amz-meta-image-width': `${metadata.width}`
    }
  }, uploadParams)).promise();
  const sm = (_config$sizes$sm = (_config$sizes = config.sizes) === null || _config$sizes === void 0 ? void 0 : _config$sizes.sm) !== null && _config$sizes$sm !== void 0 ? _config$sizes$sm : 360;
  if (sm) {
    // upload sm image
    const smFile = await imagePipeline.clone().resize(sm).toBuffer({
      resolveWithObject: true
    });
    const smFileData = {
      id,
      height: smFile.info.height,
      width: smFile.info.width,
      filesize: smFile.info.size,
      extension,
      size: 'sm'
    };
    fileData.sizesMeta.sm = smFileData;
    await s3.upload(_objectSpread({
      Body: smFile.data,
      ContentType: mimetype,
      Bucket: config.bucket,
      Key: `${config.folder}/${getFilename(smFileData)}`,
      Metadata: {
        // 'x-amz-meta-original-filename': originalFilename, // disabled per github issue #25
        'x-amz-meta-image-height': `${smFileData.height}`,
        'x-amz-meta-image-width': `${smFileData.width}`
      }
    }, uploadParams)).promise();
    // upload md image
  }
  const md = (_config$sizes$md = (_config$sizes2 = config.sizes) === null || _config$sizes2 === void 0 ? void 0 : _config$sizes2.md) !== null && _config$sizes$md !== void 0 ? _config$sizes$md : 720;
  if (md) {
    const mdFile = await imagePipeline.clone().resize(md).toBuffer({
      resolveWithObject: true
    });
    const mdFileData = {
      id,
      height: mdFile.info.height,
      width: mdFile.info.width,
      filesize: mdFile.info.size,
      extension,
      size: 'md'
    };
    fileData.sizesMeta.md = mdFileData;
    await s3.upload(_objectSpread({
      Body: mdFile.data,
      ContentType: mimetype,
      Bucket: config.bucket,
      Key: `${config.folder}/${getFilename(mdFileData)}`,
      Metadata: {
        // 'x-amz-meta-original-filename': originalFilename, // disabled per github issue #25
        'x-amz-meta-image-height': `${mdFileData.height}`,
        'x-amz-meta-image-width': `${mdFileData.width}`
      }
    }, uploadParams)).promise();
  }
  const lg = (_config$sizes$lg = (_config$sizes3 = config.sizes) === null || _config$sizes3 === void 0 ? void 0 : _config$sizes3.lg) !== null && _config$sizes$lg !== void 0 ? _config$sizes$lg : 1280;
  // upload lg image
  if (lg) {
    const lgFile = await imagePipeline.clone().resize(lg).toBuffer({
      resolveWithObject: true
    });
    const lgFileData = {
      id,
      height: lgFile.info.height,
      width: lgFile.info.width,
      filesize: lgFile.info.size,
      extension,
      size: 'lg'
    };
    fileData.sizesMeta.lg = lgFileData;
    await s3.upload(_objectSpread({
      Body: lgFile.data,
      ContentType: mimetype,
      Bucket: config.bucket,
      Key: `${config.folder}/${getFilename(lgFileData)}`,
      Metadata: {
        // 'x-amz-meta-original-filename': originalFilename, // disabled per github issue #25
        'x-amz-meta-image-height': `${lgFileData.height}`,
        'x-amz-meta-image-width': `${lgFileData.width}`
      }
    }, uploadParams)).promise();
    fileData.sizesMeta.lg = lgFileData;
  }
  if ((_config$sizes4 = config.sizes) !== null && _config$sizes4 !== void 0 && _config$sizes4.base64) {
    const base64 = await imagePipeline.clone().resize(config.sizes.base64).toBuffer({
      resolveWithObject: true
    });
    const base64Data = {
      id,
      height: base64.info.height,
      width: base64.info.width,
      filesize: base64.info.size,
      extension: 'png',
      size: 'base64',
      base64Data: `data:image/png;base64,${base64.data.toString('base64')}`
    };
    fileData.sizesMeta.base64 = base64Data;
  }
  const result = _objectWithoutProperties(fileData, _excluded$1);
  return result;
}
async function getDataFromRef(config, ref) {
  const metaRef = parseImagesMetaRef(ref);
  if (metaRef) {
    return metaRef;
  }
  const fileRef = parseImageRef(ref);
  if (!fileRef) {
    throw new Error('Invalid image reference');
  }
  const s3 = new AWS.S3(config.s3Options);

  // get data from S3 for current size
  const sizesMeta = {
    [fileRef.size]: await getS3ImageMeta(s3, config, fileRef)
  };
  for (const size of ['sm', 'md', 'lg', 'full'].filter(item => item !== fileRef.size)) {
    sizesMeta[size] = await getS3ImageMeta(s3, config, _objectSpread(_objectSpread({}, fileRef), {}, {
      size
    }));
  }
  const _sizesMeta$full = sizesMeta.full,
    imageData = _objectWithoutProperties(_sizesMeta$full, _excluded2);
  return _objectSpread(_objectSpread({}, imageData), {}, {
    sizesMeta
  });
}
async function getS3ImageMeta(s3, config, fileData) {
  var _result$Metadata, _result$Metadata2;
  const result = await s3.headObject({
    Bucket: config.bucket,
    Key: urlJoin(config.folder, getFilename(fileData))
  }).promise();
  return _objectSpread(_objectSpread({}, fileData), {}, {
    height: Number(((_result$Metadata = result.Metadata) === null || _result$Metadata === void 0 ? void 0 : _result$Metadata['x-amz-meta-image-height']) || 0),
    width: Number(((_result$Metadata2 = result.Metadata) === null || _result$Metadata2 === void 0 ? void 0 : _result$Metadata2['x-amz-meta-image-width']) || 0),
    filesize: result.ContentLength || 0
  });
}

const _excluded = ["s3Config"];
const ImageExtensionEnum = graphql.enum({
  name: 'S3ImagesExtension',
  values: graphql.enumValues(SUPPORTED_IMAGE_EXTENSIONS)
});
const S3FieldInput = graphql.inputObject({
  name: 'S3ImagesFieldInput',
  fields: {
    upload: graphql.arg({
      type: graphql.Upload
    }),
    ref: graphql.arg({
      type: graphql.String
    })
  }
});
function createInputResolver(config) {
  return async function inputResolver(data, context) {
    if (data === null || data === undefined) {
      return {
        extension: data,
        filesize: data,
        height: data,
        id: data,
        width: data
      };
    }
    if (data.ref) {
      if (data.upload) {
        throw new Error('Only one of ref and upload can be passed to ImageFieldInput');
      }
      return getDataFromRef(config, data.ref);
    }
    if (!data.upload) {
      throw new Error('Either ref or upload must be passed to ImageFieldInput');
    }
    return getDataFromStream(config, await data.upload, context);
  };
}
const _fieldConfigs = {};
const imageSizeEnum = graphql.enum({
  name: 'S3ImagesSizeEnum',
  values: graphql.enumValues(['base64', 'sm', 'md', 'lg', 'full'])
});
const imagesOutputFields = graphql.fields()({
  id: graphql.field({
    type: graphql.nonNull(graphql.ID)
  }),
  filesize: graphql.field({
    type: graphql.nonNull(graphql.Int)
  }),
  width: graphql.field({
    type: graphql.nonNull(graphql.Int)
  }),
  height: graphql.field({
    type: graphql.nonNull(graphql.Int)
  }),
  // sizesMeta: graphql.field({
  //   type: graphql.JSON,
  //   resolve(data) {
  //     return data.sizesMeta; // TODO type
  //   },
  // }),
  extension: graphql.field({
    type: graphql.nonNull(ImageExtensionEnum)
  }),
  ref: graphql.field({
    type: graphql.nonNull(graphql.String),
    args: {
      size: graphql.arg({
        type: graphql.nonNull(imageSizeEnum),
        defaultValue: 'md'
      }),
      meta: graphql.arg({
        type: graphql.nonNull(graphql.Boolean),
        defaultValue: false
      })
    },
    resolve(data, args) {
      return args.meta ? getImageMetaRef(data.id, data.sizesMeta) : getImageRef(data.id, args.size, data.extension);
    }
  }),
  url: graphql.field({
    type: graphql.String,
    args: {
      size: graphql.arg({
        type: imageSizeEnum
        // defaultValue:  'md',
      })
    },
    resolve(data, args, context, info) {
      const {
        key,
        typename
      } = info.path.prev;
      const config = _fieldConfigs[`${typename}-${key}`];
      return getUrl(config, _objectSpread(_objectSpread({}, data), {}, {
        size: args.size
      }));
    }
  }),
  srcSet: graphql.field({
    type: graphql.String,
    args: {
      sizes: graphql.arg({
        type: graphql.nonNull(graphql.list(graphql.nonNull(imageSizeEnum))),
        defaultValue: ['sm', 'md', 'lg', 'full']
      })
    },
    resolve(data, args, context, info) {
      const {
        key,
        typename
      } = info.path.prev;
      const config = _fieldConfigs[`${typename}-${key}`];
      const {
        sizesMeta
      } = data;
      if (!sizesMeta) return null;
      return args.sizes.map(size => {
        var _sizesMeta$size;
        return `${getUrl(config, _objectSpread(_objectSpread({}, data), {}, {
          size
        }))} ${(_sizesMeta$size = sizesMeta[size]) === null || _sizesMeta$size === void 0 ? void 0 : _sizesMeta$size.width}w`;
      }).join(', ');
    }
  })
});
const S3ImagesFieldOutput = graphql.interface()({
  name: 'S3ImagesFieldOutput',
  fields: imagesOutputFields,
  resolveType: () => 'S3ImagesFieldOutputType'
});
const S3ImagesFieldOutputType = graphql.object()({
  name: 'S3ImagesFieldOutputType',
  interfaces: [S3ImagesFieldOutput],
  fields: imagesOutputFields
});
function getDefaultSize(sizes) {
  const excludedSizes = Object.entries(sizes).filter(([, value]) => value === 0).map(([size]) => size);
  const availableSizes = ['sm', 'md', 'lg', 'full'].filter(size => !excludedSizes.includes(size));
  console.log('excludedSizes', excludedSizes);
  console.log('availableSizes', availableSizes);
  return availableSizes.includes('md') ? 'md' : availableSizes[0];
}
function setDefaultConfig(config) {
  config.sizes = config.sizes || {};
  config.defaultSize = config.defaultSize || getDefaultSize(config.sizes);
  return config;
}
const s3Images = _ref => {
  let {
      s3Config: _s3Config
    } = _ref,
    config = _objectWithoutProperties(_ref, _excluded);
  return meta => {
    if (typeof _s3Config === 'undefined') {
      throw new Error(`Must provide s3Config option in S3Image field for List: ${meta.listKey}, field: ${meta.fieldKey}`);
    }
    const s3Config = setDefaultConfig(_s3Config);
    _fieldConfigs[`${meta.listKey}-${meta.fieldKey}`] = s3Config;
    return fieldType({
      kind: 'multi',
      fields: {
        filesize: {
          kind: 'scalar',
          scalar: 'Int',
          mode: 'optional'
        },
        extension: {
          kind: 'scalar',
          scalar: 'String',
          mode: 'optional'
        },
        width: {
          kind: 'scalar',
          scalar: 'Int',
          mode: 'optional'
        },
        height: {
          kind: 'scalar',
          scalar: 'Int',
          mode: 'optional'
        },
        id: {
          kind: 'scalar',
          scalar: 'String',
          mode: 'optional'
        },
        sizesMeta: {
          kind: 'scalar',
          scalar: 'Json',
          mode: 'optional'
        }
      }
    })(_objectSpread(_objectSpread({}, config), {}, {
      input: {
        create: {
          arg: graphql.arg({
            type: S3FieldInput
          }),
          resolve: createInputResolver(s3Config)
        },
        update: {
          arg: graphql.arg({
            type: S3FieldInput
          }),
          resolve: createInputResolver(s3Config)
        }
      },
      output: graphql.field({
        type: S3ImagesFieldOutput,
        resolve({
          value: {
            extension,
            filesize,
            height,
            width,
            id,
            sizesMeta
          }
        }) {
          if (extension === null || !isValidImageExtension(extension) || filesize === null || height === null || width === null || id === null) {
            return null;
          }
          return {
            extension,
            filesize,
            height,
            width,
            id,
            sizesMeta: sizesMeta
          };
        }
      }),
      unreferencedConcreteInterfaceImplementations: [S3ImagesFieldOutputType],
      views: '@k6-contrib/fields-s3-images/views'
    }));
  };
};

export { s3Images };
