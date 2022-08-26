import { gql } from "@apollo/client";

export const productFormFragment = gql`
    fragment ProductFormLegacy on Product {
        title
        slug
        description
        price
        image
    }
`;

export const productQuery = gql`
    query ProductLegacy($id: ID!) {
        product(id: $id) {
            id
            updatedAt
            ...ProductForm
        }
    }
    ${productFormFragment}
`;

export const productCheckForChangesQuery = gql`
    query CheckForChangesProduct($id: ID!) {
        product(id: $id) {
            updatedAt
        }
    }
`;

export const createProductMutation = gql`
    mutation ProductFormCreateProduct($input: ProductInput!) {
        createProduct(input: $input) {
            id
            updatedAt
            ...ProductForm
        }
    }
    ${productFormFragment}
`;

export const updateProductMutation = gql`
    mutation ProductFormUpdateProduct($id: ID!, $input: ProductInput!, $lastUpdatedAt: DateTime) {
        updateProduct(id: $id, input: $input, lastUpdatedAt: $lastUpdatedAt) {
            id
            updatedAt
            ...ProductForm
        }
    }
    ${productFormFragment}
`;