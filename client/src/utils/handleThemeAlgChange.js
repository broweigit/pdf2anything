import { theme } from 'antd';

export const handleThemeAlgChange = (themeState, setThemeState) => {
  if (themeState.algorithm === theme.defaultAlgorithm) {
    setThemeState({
      token: themeState.token,
      algorithm: theme.darkAlgorithm,
    });
  } else {
    setThemeState({
      token: themeState.token,
      algorithm: theme.defaultAlgorithm,
    });
  }
};