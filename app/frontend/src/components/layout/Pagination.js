import React from 'react';
import RBPagination from 'react-bootstrap/Pagination';

/**
 * The container for presentational components for building a pagination UI.
 * Individual pages should be added as children using the `PaginationItem`
 * component.
 */
const Pagination = ({
  activePage,
  setActivePage,
  minValue,
  maxValue,
  fullyExpanded,
  showPreviousNext,
  showFirstLast,
}) => {
  // Generator for the numbered pages
  const getPaginationItem = (i) => (
    <RBPagination.Item
      key={i}
      active={i === activePage}
      onClick={() => setActivePage(i)}>
      {i}
    </RBPagination.Item>
  );

  const paginationItems = [];

  // Add the 'first' button if specified
  if (showFirstLast) {
    paginationItems.push(
      <RBPagination.First
        key="first"
        disabled={activePage === minValue}
        onClick={() => setActivePage(minValue)}
      />,
    );
  }

  // Add a 'previous' button if specified
  if (showPreviousNext) {
    paginationItems.push(
      <RBPagination.Prev
        key="previous"
        disabled={activePage === minValue}
        onClick={() => setActivePage(activePage - 1)}
      />,
    );
  }
  // Add the main number block in the middle
  // As we have a minimum of 5 blocks i.e. 1 ... active ... max there is no
  // point in not fully expanding it if there are less than 5 blocks required
  if (fullyExpanded || maxValue - minValue + 1 <= 7) {
    for (let i = minValue; i <= maxValue; i += 1) {
      paginationItems.push(getPaginationItem(i));
    }
  } else {
    // If it's not fully expanded, need to create the right blocks
    paginationItems.push(getPaginationItem(minValue));
    if (activePage <= minValue + 3) {
      // If in the first 4 blocks, needs to be in the pattern 1, 2, 3, 4, 5, ..., 10
      paginationItems.push(getPaginationItem(minValue + 1));
      paginationItems.push(getPaginationItem(minValue + 2));
      paginationItems.push(getPaginationItem(minValue + 3));
      paginationItems.push(getPaginationItem(minValue + 4));
      paginationItems.push(<RBPagination.Ellipsis disabled key="ellipsis" />);
    } else if (activePage >= maxValue - 1 * 3) {
      // If in the last 2 blocks, needs to be in the pattern 1, ..., 8, 9, 10
      paginationItems.push(<RBPagination.Ellipsis disabled key="ellipsis" />);
      paginationItems.push(getPaginationItem(maxValue - 4));
      paginationItems.push(getPaginationItem(maxValue - 3));
      paginationItems.push(getPaginationItem(maxValue - 2));
      paginationItems.push(getPaginationItem(maxValue - 1));
    } else {
      // Otherwise, needs to be in the pattern 1, ..., 5, ..., 10
      paginationItems.push(<RBPagination.Ellipsis disabled key="ellipsis-1" />);
      paginationItems.push(getPaginationItem(activePage - 1));
      paginationItems.push(getPaginationItem(activePage));
      paginationItems.push(getPaginationItem(activePage + 1));
      paginationItems.push(<RBPagination.Ellipsis disabled key="ellipsis-2" />);
    }
    // Add the biggest number
    paginationItems.push(getPaginationItem(maxValue));
  }
  // Add the 'next' button if specified
  if (showPreviousNext) {
    paginationItems.push(
      <RBPagination.Next
        key="next"
        disabled={activePage === maxValue}
        onClick={() => setActivePage(activePage + 1)}
      />,
    );
  }

  // Add the 'last' button if specified
  if (showFirstLast) {
    paginationItems.push(
      <RBPagination.Last
        key="last"
        disabled={activePage === maxValue}
        onClick={() => setActivePage(maxValue)}
      />,
    );
  }

  // Create the pagination component
  return (
    <RBPagination size="sm" className="mb-0">
      {paginationItems}
    </RBPagination>
  );
};

Pagination.defaultProps = {
  minValue: 1,
  activePage: 1,
  fullyExpanded: false,
  showPreviousNext: false,
  showFirstLast: true,
};

export default Pagination;
