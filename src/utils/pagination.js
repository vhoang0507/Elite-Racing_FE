export const PAGINATION_ELLIPSIS = 'pagination-ellipsis';

export function getCompactPaginationItems(totalPages, currentPage) {
    const numericPageCount = Number(totalPages) || 0;

    if (numericPageCount <= 0) {
        return [];
    }

    const pageCount = Math.max(1, numericPageCount);
    const activePage = Math.min(Math.max(1, Number(currentPage) || 1), pageCount);

    if (pageCount <= 4) {
        return Array.from({ length: pageCount }, (_, index) => index + 1);
    }

    const items = [1, 2, 3];

    if (activePage > 3 && activePage < pageCount) {
        if (activePage > 4) {
            items.push(`${PAGINATION_ELLIPSIS}-before`);
        }

        items.push(activePage);

        if (activePage < pageCount - 1) {
            items.push(`${PAGINATION_ELLIPSIS}-after`);
        }
    } else {
        items.push(PAGINATION_ELLIPSIS);
    }

    if (!items.includes(pageCount)) {
        items.push(pageCount);
    }

    return items;
}
