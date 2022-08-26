import { gql } from "@apollo/client";

export const productFormFragment = gql`
    fragment ProductForm on Product {
        name
        description
        price
        image
    }
`;

export const productQuery = gql`
    query Product($id: ID!) {
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
    mutation ProductFormCreateProduct($data: ProductInput!) {
        addProduct(data: $data) {
            id
            updatedAt
            ...ProductForm
        }
    }
    ${productFormFragment}
`;

export const updateProductMutation = gql`
    mutation ProductFormUpdateProduct($id: ID!, $data: ProductInput!, $lastUpdatedAt: DateTime) {
        updateProduct(id: $id, data: $data, lastUpdatedAt: $lastUpdatedAt) {
            id
            updatedAt
            ...ProductForm
        }
    }
    ${productFormFragment}
`;
