/**
 * Identidad visual de CALMA. Si el proyecto ya define estos colores con otros
 * nombres, basta con mapearlos aquí: los componentes usan solo `calma-*`.
 */
const calmaPreset = {
  theme: {
    extend: {
      colors: {
        calma: {
          salvia: '#8DAA91',
          verde: '#294D40',
          crema: '#F4F0E9',
          blanco: '#FFFFFF',
          gris: '#666B67',
          terracota: '#C98C76',
          tinta: '#1F2A25',
          linea: '#E4DED3',
        },
      },
      borderRadius: { calma: '1.25rem' },
      fontFamily: {
        sans: ['"Figtree Variable"', 'Figtree', 'system-ui', 'sans-serif'],
        display: ['"Outfit Variable"', 'Outfit', 'system-ui', 'sans-serif'],
      },
    },
  },
};
export default calmaPreset;
