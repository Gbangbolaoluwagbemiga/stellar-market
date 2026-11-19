import { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryClient from "./CategoryClient";
import { JOB_CATEGORIES, categoryToSlug } from "@/constants/jobs";

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Frontend:
    "Find expert frontend developers for React, Next.js, Vue, and modern web applications on StellarMarket.",
  Backend:
    "Hire skilled backend developers specializing in Node.js, Python, databases, and API development.",
  "Smart Contract":
    "Connect with Soroban and Stellar smart contract developers for blockchain solutions.",
  Design:
    "Discover talented UI/UX designers, graphic designers, and brand specialists.",
  Mobile:
    "Find mobile app developers for iOS, Android, and cross-platform development.",
  Documentation:
    "Hire technical writers and documentation specialists for your project.",
  DevOps:
    "Find DevOps engineers for CI/CD, cloud infrastructure, and platform automation.",
};

function slugToCategory(slug: string): string | null {
  const category = JOB_CATEGORIES.find(
    (cat) => categoryToSlug(cat) === slug.toLowerCase(),
  );
  return category ?? null;
}

export async function generateStaticParams() {
  return JOB_CATEGORIES.map((category) => ({
    slug: categoryToSlug(category),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const validCategory = slugToCategory(slug);

  if (!validCategory) {
    return {
      title: "Category Not Found | StellarMarket",
    };
  }

  const description = CATEGORY_DESCRIPTIONS[validCategory];

  return {
    title: `${validCategory} Jobs | StellarMarket`,
    description,
    openGraph: {
      title: `${validCategory} Jobs on StellarMarket`,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${validCategory} Jobs | StellarMarket`,
      description,
    },
  };
}

export const revalidate = 600;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const validCategory = slugToCategory(slug);

  if (!validCategory) {
    notFound();
  }

  return <CategoryClient category={validCategory} slug={slug} />;
}
