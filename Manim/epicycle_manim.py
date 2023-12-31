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

# Parameters
max_vectors = 175
speed = 10
play_time = -1
min_rad = 0.5

fps = config.frame_rate

class Fourier_Epicycles(Scene):
    def __init__(self, arrow_dat, **kwargs):
        self.arrow_dat = arrow_dat
        super().__init__(**kwargs)

    def get_next_pos(self, x):
        return np.array(
            [
                x.get_length() * cos(x.get_angle() + x.freq * speed / fps),
                x.get_length() * sin(x.get_angle() + x.freq * speed / fps),
                0,
            ]
        )

    def construct(self):
        arrow_dat = self.arrow_dat
        N = len(arrow_dat)

        if N > max_vectors:
            arrow_dat = arrow_dat[0:max_vectors]
            N = max_vectors

        print("Number of vectors being used:", N)
        print("Rendering in", config.pixel_height, "p ", fps, "fps\n")

        ax = NumberPlane(
            x_range=[-5, 5],
            y_range=[-5, 5],
            background_line_style={"stroke_opacity": 0.4},
        )
        start_time = time()

        vg = VGroup()

        dat = arrow_dat[0]

        circ = Circle(radius=dat[0], color=BLUE_D)

        rotArrow = Arrow(
            start=ORIGIN, end=np.array([dat[2], dat[3], 0]), color=WHITE, buff=0
        )
        rotArrow.set(freq=dat[1])
        vg.add(circ, rotArrow)
        vgl = 2
        vg[1].add_updater(
            lambda x: x.put_start_and_end_on(start=ORIGIN, end=self.get_next_pos(x))
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
                    end=vg[x.idx].get_end() + self.get_next_pos(x),
                )
            )

        trace = TracedPath(vg[vgl - 1].get_end, stroke_width=10, stroke_color=YELLOW_C)
        vg.add(trace)
        self.add(ax, vg)

        if play_time > 0:
            print("Animation Length:", play_time, "seconds")
            self.wait(play_time)
        else:
            time_period = 2 * np.pi / (abs(arrow_dat[0][1]) * speed)
            print("Animation Length:", time_period, "seconds")
            self.wait(time_period)

        print("Time Taken", time() - start_time)


if __name__ == "__main__":
    imgName = "last"  #   "Robot.png"  "celeb1.jpeg"  "pi-symbol.png"
    arrow_dat = np.genfromtxt(
        "../arrow_data/arrow_dat_" + imgName + ".csv", delimiter=","
    )

    Fourier_Epicycles(arrow_dat).render(preview=True)
    print("Done rendering")
