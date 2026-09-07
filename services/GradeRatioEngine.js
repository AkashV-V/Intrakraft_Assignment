/**
 * GradeRatioEngine Class
 * Object-Oriented Service for catalogue grouping, size ranking algorithms,
 * and grade-wise ratio calculations.
 */
class GradeRatioEngine {
  constructor() {
    this.SIZE_ORDER = [
      'XXS', 'Extra Small', 'XS', 'S', 'Small', 'M', 'Medium', 'L', 'Large', 'XL', 'X-Large',
      'XXL', 'XX-Large', 'XXXL', 'XXX-Large', '4XL',
      '2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y', '7-8Y', '8-9Y', '9-10Y', '10-11Y', '11-12Y', '12-13Y', '13-14Y', '14-15Y', '15-16Y',
      '28', '30', '32', '34', '36', '38', '40', '42', '44', '46'
    ];

    this.RATIO_LEVELS = {
      'Brick': ['brick'],
      'Category': ['category'],
      'Brick + Neck': ['brick', 'neck'],
      'Brick + Sleeve': ['brick', 'sleeve'],
      'Brick + Category': ['category', 'brick']
    };
  }

  /**
   * Data Structure Algorithm: Size Rank Indexing
   */
  getSizeRank(sizeName) {
    const index = this.SIZE_ORDER.indexOf(sizeName);
    return index === -1 ? 999 : index;
  }

  /**
   * Sorting Algorithm: Sort size arrays based on canonical size order
   */
  sortSizes(sizeArray) {
    if (!Array.isArray(sizeArray)) return [];
    return [...sizeArray].sort((a, b) => this.getSizeRank(a) - this.getSizeRank(b));
  }

  /**
   * Group Key Generation Algorithm
   */
  getGroupKey(product, ratioLevel = 'Brick') {
    const fields = this.RATIO_LEVELS[ratioLevel] || ['brick'];
    return fields
      .map(field => {
        const val = product[field];
        return val && String(val).trim() !== '' ? String(val).trim() : '—';
      })
      .join(' / ');
  }

  /**
   * Batch Grouping Algorithm for Cart items
   */
  groupCartItems(cartItems, productsMap, ratioLevel = 'Brick') {
    const groups = new Map();

    for (const item of cartItems) {
      const product = productsMap.get(item.productKey);
      if (!product) continue;

      const groupKey = this.getGroupKey(product, ratioLevel);
      const comboKey = `${groupKey}||${item.grade}`;

      if (!groups.has(comboKey)) {
        groups.set(comboKey, {
          groupKey,
          grade: item.grade,
          sizesSet: new Set()
        });
      }

      const groupObj = groups.get(comboKey);
      (product.sizes || []).forEach(size => groupObj.sizesSet.add(size));
    }

    return Array.from(groups.values()).map(g => ({
      groupKey: g.groupKey,
      grade: g.grade,
      sizes: this.sortSizes(Array.from(g.sizesSet))
    }));
  }

  /**
   * Apply Ratio Calculation Algorithm
   * Calculates size quantities based on sets multiplier and grade ratio
   */
  applyRatiosToCart(cartItems, productsMap, ratioMap, ratioLevel = 'Brick') {
    return cartItems.map(item => {
      const product = productsMap.get(item.productKey);
      if (!product) return item;

      const groupKey = this.getGroupKey(product, ratioLevel);
      const key = `${ratioLevel}||${groupKey}||${item.grade}`;
      const ratio = ratioMap[key] || ratioMap[`${groupKey}||${item.grade}`];

      if (!ratio) return item;

      const updatedSizeQty = {};
      const sets = Number(item.sets) || 1;

      (product.sizes || []).forEach(size => {
        const multiplier = Number(ratio[size]) || 0;
        updatedSizeQty[size] = multiplier * sets;
      });

      return {
        ...item,
        sizeQty: updatedSizeQty
      };
    });
  }
}

module.exports = new GradeRatioEngine();
