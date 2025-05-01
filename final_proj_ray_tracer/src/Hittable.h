#include "Vec3.h"
#include "Ray.h"

struct Hittable_record {
    Vec3 p;
    Vec3 n;
    double t;
    bool front_face;

    inline void set_face_normal(const Ray& r, const Vec3& outward_n) {
        front_face = dot(r.dir, outward_n) < 0;
        n = front_face ? outward_n : negate_vec(outward_n);
    }
};

class Hittable {
    public:
        virtual bool hit(const Ray& r, double t_min, double t_max, Hittable_record& rec) const = 0;
};