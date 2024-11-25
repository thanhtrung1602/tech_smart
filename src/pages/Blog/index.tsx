import ListBlog from "~/components/Blog/ListBlog/ListBlog";
import NewBlog from "~/components/Blog/Newblog/NewBlog";

function Blog() {
  return (
    <div className="px-40 py-4">
      <div className="container">
        <div className="pt-4">
          <NewBlog />
        </div>
        <div className="pt-4">
          <span className="text-3xl font-medium mb-4">Danh sách tin tức</span>
          <ListBlog />
        </div>
      </div>
    </div>
  );
}

export default Blog;
