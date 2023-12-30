from manim import (
    config,
    Scene,
    NumberPlane,
    ORIGIN,
    WHITE,
    BLUE_D,
    YELLOW_C,
    TracedPath,
    VGroup,
    Arrow,
    Circle,
)
from math import cos, sin
import numpy as np
from time import time

max_n_vectors = 175
speed = 10
play_time = 10
fps = config.frame_rate
min_rad = 0.2

imgName = "pi-symbol.png"
arrow_dat = np.genfromtxt("../arrow_data/arrow_dat_" + imgName + ".csv", delimiter=",")
N = len(arrow_dat)

if N > max_n_vectors:
    arrow_dat = arrow_dat[0:max_n_vectors]
    N = max_n_vectors

print("Number of vectors being used:", N)
print("Rendering in", config.pixel_height,"p ", fps, "fps\n")


class Fourier_Epicycles(Scene):
    def construct(self):
        ax = NumberPlane(
            x_range=[-5, 5],
            y_range=[-5, 5],
            background_line_style={"stroke_opacity": 0.4},
        )
        start_time = time()

        vg = VGroup()

        dat = arrow_dat[0]
        # print(arrow_dat)

        circ = Circle(radius=dat[0], color=BLUE_D)

        rotArrow = Arrow(
            start=ORIGIN, end=np.array([dat[2], dat[3], 0]), color=WHITE, buff=0
        )
        rotArrow.set(freq=dat[1])
        vg.add(circ, rotArrow)
        vgl = 2
        vg[1].add_updater(
            lambda x: x.put_start_and_end_on(
                start=ORIGIN,
                end=np.array(
                    [
                        x.get_length() * cos(x.get_angle() + x.freq * speed / fps),
                        x.get_length() * sin(x.get_angle() + x.freq * speed / fps),
                        0,
                    ]
                ),
            )
        )

        for i in range(1, N):
            prev_idx = vgl - 1
            dat = arrow_dat[i]

            if dat[0] > min_rad:
                circ = Circle(radius=dat[0], color=BLUE_D).move_to(
                    vg[prev_idx].get_end()
                )
                circ.set(idx=prev_idx)
                vg.add(circ)
                vgl += 1
                vg[vgl - 1].add_updater(lambda x: x.move_to(vg[x.idx].get_end()))

            rotArrow = Arrow(
                start=vg[prev_idx].get_end(),
                end=vg[prev_idx].get_end() + np.array([dat[2], dat[3], 0]),
                color=WHITE,
                buff=0,
            )
            rotArrow.set(idx=prev_idx)
            rotArrow.set(freq=dat[1])
            vg.add(rotArrow)
            vgl += 1
            vg[vgl - 1].add_updater(
                lambda x: x.put_start_and_end_on(
                    start=vg[x.idx].get_end(),
                    end=vg[x.idx].get_end()
                    + np.array(
                        [
                            x.get_length() * cos(x.get_angle() + x.freq * speed / fps),
                            x.get_length() * sin(x.get_angle() + x.freq * speed / fps),
                            0,
                        ]
                    ),
                )
            )

        trace = TracedPath(vg[vgl - 1].get_end, stroke_width=10, stroke_color=YELLOW_C)
        vg.add(trace)
        # new_height=2*(arrow_dat[0][0] + 3*arrow_dat[1][0])
        # self.camera.frame_height=new_height
        # self.camera.frame_width=16*new_height/9
        # self.camera.frame_height = 10
        # self.camera.frame_width = 10
        self.add(ax, vg)
        self.wait(play_time)

        print("Time Taken", time() - start_time)


# if __name__ == '__main__':
# scene = Fourier_Epicycles()
# scene.render(preview=True)

# result = subprocess.run(["manim","-pqm", "manim_part.py", "Fourier_Epicycles"])
# output = result.stdout.decode("utf-8")
# print(type(result))
