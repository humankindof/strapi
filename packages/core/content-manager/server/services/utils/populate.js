'use strict';

const { merge, isEmpty } = require('lodash/fp');
const strapiUtils = require('@strapi/utils');

const { hasDraftAndPublish, isVisibleAttribute } = strapiUtils.contentTypes;
const { isAnyToMany } = strapiUtils.relations;
const { PUBLISHED_AT_ATTRIBUTE } = strapiUtils.contentTypes.constants;

const getDeepPopulate = (
  uid,
  populate,
  { onlyMany = false, countMany = false, maxLevel = Infinity } = {},
  level = 1
) => {
  if (populate) {
    return populate;
  }

  if (level > maxLevel) {
    return {};
  }

  const model = strapi.getModel(uid);

  return Object.keys(model.attributes).reduce((populateAcc, attributeName) => {
    const attribute = model.attributes[attributeName];

    if (attribute.type === 'relation') {
      const isManyRelation = isAnyToMany(attribute);
      // always populate createdBy, updatedBy, localizations etc.
      if (!isVisibleAttribute(model, attributeName)) {
        populateAcc[attributeName] = true;
      } else if (!onlyMany || isManyRelation) {
        // Only populate one level of relations
        populateAcc[attributeName] = countMany && isManyRelation ? { count: true } : true;
      }
    }

    if (attribute.type === 'component') {
      populateAcc[attributeName] = {
        populate: getDeepPopulate(
          attribute.component,
          null,
          { onlyMany, countMany, maxLevel },
          level + 1
        ),
      };
    }

    if (attribute.type === 'media') {
      populateAcc[attributeName] = { populate: 'folder' };
    }

    if (attribute.type === 'dynamiczone') {
      populateAcc[attributeName] = {
        populate: (attribute.components || []).reduce((acc, componentUID) => {
          return merge(
            acc,
            getDeepPopulate(componentUID, null, { onlyMany, countMany, maxLevel }, level + 1)
          );
        }, {}),
      };
    }

    return populateAcc;
  }, {});
};

const getDeepPopulateDraftCount = (uid) => {
  const model = strapi.getModel(uid);
  let hasRelations = false;

  const populate = Object.keys(model.attributes).reduce((populateAcc, attributeName) => {
    const attribute = model.attributes[attributeName];

    switch (attribute.type) {
      case 'relation': {
        const childModel = strapi.getModel(attribute.target);
        if (hasDraftAndPublish(childModel) && isVisibleAttribute(model, attributeName)) {
          populateAcc[attributeName] = {
            count: true,
            filters: { [PUBLISHED_AT_ATTRIBUTE]: { $null: true } },
          };
          hasRelations = true;
        }
        break;
      }
      case 'component': {
        const { populate, hasRelations: childHasRelations } = getDeepPopulateDraftCount(
          attribute.component
        );
        if (childHasRelations) {
          populateAcc[attributeName] = { populate };
          hasRelations = true;
        }
        break;
      }
      case 'dynamiczone': {
        const dzPopulate = (attribute.components || []).reduce((acc, componentUID) => {
          const { populate, hasRelations: childHasRelations } =
            getDeepPopulateDraftCount(componentUID);
          if (childHasRelations) {
            hasRelations = true;
            return merge(acc, populate);
          }
          return acc;
        }, {});

        if (!isEmpty(dzPopulate)) {
          populateAcc[attributeName] = { populate: dzPopulate };
        }
        break;
      }
      default:
    }

    return populateAcc;
  }, {});

  return { populate, hasRelations };
};

module.exports = {
  getDeepPopulate,
  getDeepPopulateDraftCount,
};
