document.addEventListener('DOMContentLoaded', function() {
  const accordionTriggers = document.querySelectorAll('.accordion-item-trigger');
  
  accordionTriggers.forEach(trigger => {
    trigger.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      
      // Close all other accordions
      accordionTriggers.forEach(otherTrigger => {
        if (otherTrigger !== trigger) {
          otherTrigger.setAttribute('aria-expanded', 'false');
        }
      });
      
      // Toggle current accordion
      this.setAttribute('aria-expanded', !isExpanded);
    });
  });
});
