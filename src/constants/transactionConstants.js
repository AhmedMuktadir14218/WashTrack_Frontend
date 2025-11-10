export const TRANSACTION_TYPES = {
  RECEIVE: 1,
  DELIVERY: 2,
};

export const TRANSACTION_TYPE_LABELS = {
  [TRANSACTION_TYPES.RECEIVE]: 'Receive',
  [TRANSACTION_TYPES.DELIVERY]: 'Delivery',
};

export const TRANSACTION_TYPE_COLORS = {
  [TRANSACTION_TYPES.RECEIVE]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    badge: 'bg-green-500',
  },
  [TRANSACTION_TYPES.DELIVERY]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    badge: 'bg-blue-500',
  },
};

export const STAGE_PLACEHOLDER_ICON = (stageName) => {
  const stageMap = {
    '1st Dry': '🏭',
    'Unwash': '💧',
    '2nd Dry': '🔥',
    '1st Wash': '🧼',
    'Final Wash': '✨',
  };
  return stageMap[stageName] || '📦';
};