interface ICategories {
    id: number;
    name: string;
    slug: string;
    img: string;
    createdAt: Date;
    updatedAt: Date;
}

class Categories implements ICategories {
    id: number;
    name: string;
    slug: string;
    img: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(id: number, name: string, slug: string, img: string, createdAt: Date, updatedAt: Date) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.img = img;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

export default Categories
