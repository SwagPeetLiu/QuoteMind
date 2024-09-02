/**
 * ========================================================================
 * Stlyer codes used to perform css aniamtions on HTML elements
 * ========================================================================
 */
function fadeOutElement(element, duration) {
    element.style.opacity = 1;
    element.style.transition = `opacity ${duration}ms ease`;
    element.style.opacity = 0;
    setTimeout(() => {
        element.remove();
    }, duration);
}

function fadeOutSlideRight(element, duration, slideDistance = 20) {
    // Store the element's original position
    const originalPosition = window.getComputedStyle(element).position;
    const originalRight = window.getComputedStyle(element).right;

    // Set the element to relative positioning if it's not already absolute or fixed
    if (originalPosition !== 'absolute' && originalPosition !== 'fixed') {
        element.style.position = 'relative';
    }

    // Set initial styles
    element.style.opacity = '1';
    element.style.right = originalRight;
    element.style.transition = `opacity ${duration}ms ease, right ${duration}ms ease`;

    // Trigger the animation
    setTimeout(() => {
        element.style.opacity = '0';
        element.style.right = `${-slideDistance}px`;
    }, 10); // Small delay to ensure the initial styles are applied

    // Remove the element after the animation
    setTimeout(() => {
        element.remove();
        // If we changed the positioning, we should clean that up on any parent element
        if (element.parentElement && originalPosition !== 'absolute' && originalPosition !== 'fixed') {
            element.parentElement.style.position = '';
        }
    }, duration);
}
module.exports = { fadeOutElement, fadeOutSlideRight }