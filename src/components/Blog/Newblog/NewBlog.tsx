import React from "react";
import useBlog from "~/hooks/useBlog";
import Blog from "~/models/Blog";
import SmallBlog from "~/components/Blog/BlogComponent/SmallBlog/Smallblog";
import BigBlog from "~/components/Blog/BlogComponent/BigBlog/BigBlog";

export default function NewBlog() {
    const { data: blogs } = useBlog<Blog[]>(`/posts`);

    return(
    
    <div className="gap-x-4 grid grid-cols-11">
        {blogs && blogs?.length > 0 && (
          <>
            <div className="col-span-6 bg-white p-6 rounded-lg shadow-md">
              <BigBlog
                title={blogs[0].title.rendered}
                excerpt={blogs[0].excerpt.rendered}
                featured_media={blogs[0].featured_media}
                slug={blogs[0].slug}
              />
            </div>

            <div className="grid grid-cols-2 col-span-5 gap-4">
              {blogs.slice(1, 5).map((blog) => (
                <div key={blog.id} className="flex flex-col items-start bg-white p-4 rounded-lg shadow-md">
                  <SmallBlog
                    title={blog.title.rendered}
                    featured_media={blog.featured_media}
                    slug={blog.slug}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>)
    
}
