import type { NextConfig } from "next";

const basePath = process.env.NEXT_BASE_PATH?.trim() ?? "";

const nextConfig: NextConfig = {
	...(basePath
		? {
			basePath,
			assetPrefix: basePath,
		}
		: {}),
	turbopack: {
		root: __dirname,
	},
};

export default nextConfig;
