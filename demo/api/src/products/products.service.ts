import { FilterQuery } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { Product } from "@src/products/entities/product.entity";

import { NumberFilter, ProductFilter, StringFilter } from "./dto/products.args";

@Injectable()
export class ProductsService {
    getFindCondition(query?: string, filter?: ProductFilter): FilterQuery<Product> {
        const andFilters = [];
        if (query) {
            andFilters.push({
                $or: [
                    {
                        name: {
                            $ilike: `%${query}%`,
                        },
                    },
                    {
                        description: {
                            $ilike: `%${query}%`,
                        },
                    },
                ],
            });
        }
        if (filter) {
            const convertFilter = (filter: ProductFilter): FilterQuery<Product> => {
                return Object.entries(filter).reduce((acc, [filterPropertyName, filterProperty]) => {
                    if (filterPropertyName == "and") {
                        const value = filterProperty as ProductFilter[];
                        if (value) {
                            acc.$and = value.map(convertFilter);
                        }
                    } else if (filterPropertyName == "or") {
                        const value = filterProperty as ProductFilter[];
                        if (value) {
                            acc.$or = value.map(convertFilter);
                        }
                    } else if (filterProperty instanceof StringFilter) {
                        acc[filterPropertyName] = {};
                        if (filterProperty.contains !== undefined) {
                            acc[filterPropertyName].$ilike = `%${filterProperty.contains}%`; //TODO quote
                        }
                        if (filterProperty.startsWith !== undefined) {
                            //TODO don't overwrite $ilike from contains
                            acc[filterPropertyName].$ilike = `${filterProperty.startsWith}%`;
                        }
                        if (filterProperty.endsWith !== undefined) {
                            acc[filterPropertyName].$ilike = `%${filterProperty.endsWith}`;
                        }
                        if (filterProperty.equal !== undefined) {
                            acc[filterPropertyName].$eq = filterProperty.equal;
                        }
                        if (filterProperty.notEqual !== undefined) {
                            acc[filterPropertyName].$neq = filterProperty.notEqual;
                        }
                    } else if (filterProperty instanceof NumberFilter) {
                        acc[filterPropertyName] = {};
                        if (filterProperty.equal !== undefined) {
                            acc[filterPropertyName].$eq = filterProperty.equal;
                        }
                        if (filterProperty.lowerThan !== undefined) {
                            acc[filterPropertyName].$lt = filterProperty.lowerThan;
                        }
                        if (filterProperty.greaterThan !== undefined) {
                            acc[filterPropertyName].$gt = filterProperty.greaterThan;
                        }
                        if (filterProperty.lowerThanEqual !== undefined) {
                            acc[filterPropertyName].$lte = filterProperty.lowerThanEqual;
                        }
                        if (filterProperty.greaterThanEqual !== undefined) {
                            acc[filterPropertyName].$gte = filterProperty.greaterThanEqual;
                        }
                        if (filterProperty.notEqual !== undefined) {
                            acc[filterPropertyName].$ne = filterProperty.notEqual;
                        }
                    } else {
                        throw new Error(`Unsupported filter ${filterPropertyName}`);
                    }
                    return acc;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                }, {} as FilterQuery<any>);
            };
            andFilters.push(convertFilter(filter));
        }
        return andFilters.length > 0 ? { $and: andFilters } : {};
    }
}
