export function useApi() {
  const getServerUrl = (uri: string): string => {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL;
    return `${baseUrl}/api/${uri}`;
  };
  /**
   * 商品名を取得する関数
   * @param jan
   * @returns
   */
  const searchProduct = async (jan: string): Promise<string> => {
    const url = getServerUrl(`search?jan=${jan}`);
    console.log("🔥 API URL:", url);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": process.env.EXPO_PUBLIC_TOKEN,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.title;
  };

  /**
   * 商品を追加する
   * @param jancode
   * @param name
   * @returns
   */
  const addProduct = async (jancode: string, name: string): Promise<any> => {
    const url = getServerUrl("addProduct");
    console.log("🔥 API URL:", url);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.EXPO_PUBLIC_TOKEN,
      },
      body: JSON.stringify({ jancode, name }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  };

  return { searchProduct, addProduct };
}
