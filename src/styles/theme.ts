interface iTheme {
  type: string
  colors: {
    primary: string;
    secondary: string;
    white: string;
    black: string;
    success: string;
    danger: string;
    background: string;
    componentBackground: string;
    border: string;
    gray: string;
    toolTipBackground: string;
    toolTipBorder: string;
  };
}

export const darkTheme: iTheme = {
  type: 'dark',
  colors: {
    primary: '#864CFF',
    secondary: '#41FFC6',
    white: '#F5F5F5',
    black: '#141414',
    success: '#25D757',
    danger: '#F85640',
    background: '#2D1B4E',
    componentBackground: '#181818',
    border: '#222222',
    gray: '#AAAAAA',
    toolTipBackground: '#25253475',
    toolTipBorder: '#373755',
  },
};

export const lightTheme: iTheme = {
  type: 'light',
  colors: {
    primary: '#864CFF',
    secondary: '#2CC798',
    white: '#333',
    black: '#f7f7fd',
    success: '#25D757',
    danger: '#F85640',
    background: '#FFFFFF',
    componentBackground: '#F5F5F5',
    border: '#eee',
    gray: '#7b7b7b',
    toolTipBackground: '#eee',
    toolTipBorder: '#fff',
  },
};
