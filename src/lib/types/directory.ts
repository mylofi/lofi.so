export interface DirectoryItem {
    id: number;
    fields: {
        Main_Category: number;
        Title: string;
        slug: string;
        author: string;
        url: string;
        icon: string;
        description: string;
        Categories: (string | number)[] | null;
        Uses: (string | number)[] | null;
    };
}

export interface Category {
    id: number;
    fields: {
        Name: string;
        slug: string;
    };
}

export interface MainCategory {
    id: number;
    fields: {
        Name: string;
        Slug: string;
    };
}

export interface DirectoryData {
    records: DirectoryItem[];
}

export interface CategoryData {
    records: Category[];
}

export interface MainCategoryData {
    records: MainCategory[];
} 