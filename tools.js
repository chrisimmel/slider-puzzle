
/**
 * Inserts a given element into an array using a binary search based on a given ordering
 * metric.  Order is ascending based on the metric.
 */
function binaryInsert(newElem, elements, metric) {
    var newMetric = metric(newElem);

    var minIndex = 0;
    var maxIndex = elements.length - 1;
    var insertIndex = -1;

    // Do a binary search to find the right insertion point.
    while (minIndex <= maxIndex && insertIndex < 0) {
        var currentIndex = (minIndex + maxIndex) / 2 | 0;
        var currentElement = elements[currentIndex];
        var currentMetric = metric(currentElement);

        if (currentMetric < newMetric) {
            minIndex = currentIndex + 1;
        }
        else if (currentMetric > newMetric) {
            maxIndex = currentIndex - 1;
        }
        else {
            insertIndex = currentIndex;
        }
    }
    if (insertIndex == -1) {
        insertIndex = ~maxIndex;
    }
        
    elements.splice(Math.abs(insertIndex), 0, newElem);
}
