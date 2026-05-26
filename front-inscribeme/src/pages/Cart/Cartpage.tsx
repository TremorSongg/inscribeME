import { useState } from "react";
import CartItem from "../components/cart/CartItem";
import CartSummary from "../components/cart/CartSummary";
import EmptyCart from "../components/cart/EmptyCart";
import UnauthenticatedMessage from "../components/cart/UnauthenticatedMessage";

type AuthUser = {
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

export type CartCourse = {
  id: number;
  title: string;
  category: string;
  instructor: string;
  price: number;
  imageUrl: string;
};

const CartPage = () => {
  const storedUser = localStorage.getItem("authUser");
  const user: AuthUser | null = storedUser ? JSON.parse(storedUser) : null;

  const storedCart = localStorage.getItem("cartCourses");

  const [cartCourses, setCartCourses] = useState<CartCourse[]>(
    storedCart ? JSON.parse(storedCart) : []
  );

  const handleRemoveCourse = (courseId: number) => {
    const updatedCart = cartCourses.filter((course) => course.id !== courseId);

    setCartCourses(updatedCart);
    localStorage.setItem("cartCourses", JSON.stringify(updatedCart));
  };

  if (!user) {
    return <UnauthenticatedMessage />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] px-6 py-12 text-[#212121]">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#FFA000]">
            Inscríbeme
          </p>

          <h1 className="mt-2 text-4xl font-bold text-[#37474F]">
            Carrito de cursos
          </h1>

          <p className="mt-3 text-[#455A64]">
            Revisa los cursos que agregaste antes de confirmar tu inscripción.
          </p>
        </div>

        {cartCourses.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <section className="space-y-5">
              {cartCourses.map((course) => (
                <CartItem
                  key={course.id}
                  course={course}
                  onRemove={handleRemoveCourse}
                />
              ))}
            </section>

            <CartSummary cartCourses={cartCourses} />
          </div>
        )}
      </section>
    </div>
  );
};

export default CartPage;