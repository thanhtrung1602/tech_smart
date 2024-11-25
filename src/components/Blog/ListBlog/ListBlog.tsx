import useBlog from "~/hooks/useBlog";
import Blogs from "~/models/Blog";
import MediumBlog from '../BlogComponent/MediumBlog/MediumBlog';

export default function ListBlog() {
    const { data: blogs } = useBlog<Blogs[]>(`/posts`);

    return (
        <div className='bg-white p-2 rounded-lg shadow-md'>
            {blogs && blogs?.length > 0 && (
                blogs.map((blog) => (
                    <MediumBlog
                        key={blog.id}
                        title={blog.title.rendered}
                        excerpt={blog.excerpt.rendered}
                        featured_media={blog.featured_media}
                        slug={blog.slug}
                    />
                ))
            )}
        </div>
    )
}