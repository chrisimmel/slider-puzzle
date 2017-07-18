
/**
 * Destructively inserts a given element into an array using a binary search based on a
 * given ordering metric.  Order is ascending based on the metric.
 */
function binaryInsert(newElem, elements, metric) {
    var newMetric = metric(newElem);

    var minIndex = 0;
    var maxIndex = elements.length - 1;
    var insertIndex = -1;

    // Do a binary search to find the right insertion point.
    while (minIndex <= maxIndex && insertIndex < 0) {
        var currentIndex = Math.floor((minIndex + maxIndex) / 2);
        var currentElement = elements[currentIndex];
        var currentMetric = metric(currentElement);

        if (currentMetric < newMetric) {
            // Insertion point is to the right.
            minIndex = currentIndex + 1;
        }
        else if (currentMetric > newMetric) {
            // Insertion point is to the left.
            maxIndex = currentIndex - 1;
        }
        else {
            // Insertion point is here!
            insertIndex = currentIndex;
        }
    }
    if (insertIndex == -1) {
        // No interim position found.  Insert at end.
        insertIndex = maxIndex + 1;
    }

    // Do the insertion.
    elements.splice(insertIndex, 0, newElem);
}
