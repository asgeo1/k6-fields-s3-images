import { BaseListTypeInfo, FieldTypeFunc } from '@keystone-6/core/types';
import { S3FieldConfig } from "./types.js";
export declare const s3Images: <ListTypeInfo extends BaseListTypeInfo>({ s3Config: _s3Config, ...config }: S3FieldConfig<ListTypeInfo>) => FieldTypeFunc<ListTypeInfo>;
