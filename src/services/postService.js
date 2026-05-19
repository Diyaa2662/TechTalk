import api from "./api";

// جلب البوستات الموصى بها
export const getRecommendedPosts = async (page = 1, perPage = 10) => {
  try {
    const response = await api.get(
      `/posts/recommended?page=${page}&per_page=${perPage}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};
